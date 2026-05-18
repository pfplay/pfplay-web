# #303 — auth-setup 미인증 storageState 오염 근본 수정 (A + B 통합) 설계

- 작성일: 2026-05-19
- 대상 이슈: pfplay-web#303 (만성 E2E flake), #312 (B 일시 401 bounded retry, supersede 대상)
- 대상 레포: pfplay-web (development=stg)
- 분류: E2E 인프라(테스트) + 제품 인증 에러처리 (cross-cutting)

## 1. 배경 / 문제

`vercel-preview-e2e.yml` Playwright E2E 가 만성적으로 `createPlaylistWithTracks`
헬퍼의 `/^playlist$/i` 사이드바 버튼 30s 가시성 타임아웃으로 실패(`e2e-a`,
`e2e-b`, `e2e-d`). 동일 커밋 재실행 시 통과해 "flaky" 로 분류되어 왔다.

이전 두 가설은 **모두 다운스트림 증상**이었다:

1. "서버측 SSR me-fetch 401 → hydrate → redirect" — 서버측 프로브 3/3 가
   `ReferenceError: window is not defined`(별개 잠복버그 L1, with-debugger). 서버는
   401 을 만들지도 못함 → 폐기.
2. "클라이언트 cold SSR sidebar 렌더 레이스" — 사이드바 미렌더는 me-fetch 401
   의 *결과*이지 원인이 아님 → 폐기.

## 2. 근본 원인 (확정 — 정상 run vs 실패 run 차등 증거)

E2E auth-setup(`e2e/auth/shared.ts`) 흐름:

1. `goto /sign-in` → dev-full-crew 클릭 → 앱이 `POST
/v1/users/members/sign/temporary/full-member` (세션 쿠키 발급) 발사.
2. 그 POST 완료 **전에**, 루트 트리의 `useFetchMe`(=`Promise.all([getMyInfo(),
getMyProfileSummary()])`) 와 프로필 부트스트랩이 `/me*` 사전인증 요청 →
   **정상적인 401** (아직 미인증).
3. `getMyInfo()` 만 `@SkipGlobalErrorHandling`(public route 면제) 보유 —
   **`getMyProfileSummary()` 및 mutation(`updateMyWallet` 등)은 데코레이터
   없음**. 면제 없는 401 이 `handleBubbledError`(QueryCache/MutationCache
   `onError`) 도달.
4. `handleBubbledError`: `isAuthError(401)` → `/sign-in` 은 `/`·`/link/` 아님 →
   **`location.href='/'`** 하드 네비게이션.
5. 그 네비게이션이 진행 중인 sign-in POST 를 **abort**
   (`net::ERR_ABORTED POST .../sign/temporary/full-member`).
6. sign-in 미완료 → 세션 쿠키 미발급. auth-setup 재시도 루프는 **URL 이
   `/parties` 인지만 검사**(인증 성공 여부 미확인) → `context.storageState()`
   가 **미인증 상태**를 기록.
7. 그 storageState 를 쓰는 모든 spec → `/me` 401 → ProtectedLayout `return
null` + redirect → `createPlaylistWithTracks` 사이드바 30s 타임아웃 = #303.

**차등 증거:**

|                                    | 실패 run 26029697219 (a-user1)                    | 성공 run 26001609136 (a-user1) |
| ---------------------------------- | ------------------------------------------------- | ------------------------------ |
| `POST /sign/temporary/full-member` | **`net::ERR_ABORTED`** (1617ms)                   | abort 없음 (정상 완료)         |
| 사전인증 401                       | me/info·me/profile/summary·me/profile/wallet 다발 | 단발 후 해소                   |
| storageState                       | 미인증 기록                                       | 유효 세션 기록                 |

abort(1617ms)가 테스트 자체 `goto /parties`(1832ms) **이전** = 앱 네비게이션
원인(테스트 아님). `/sign-in ∈ PUBLIC_ROUTE_PREFIXES` 이고 `getMyInfo` 는
skip-marked 이므로, redirect 를 유발한 401 은 **non-skip
경로**(`getMyProfileSummary` 데코레이터 누락 또는 사전인증 mutation 401).

**"flaky" 인 이유**: sign-in POST 완료 vs 사전인증-401→redirect 의 타이밍
레이스. warm/fast = POST 승리(pass), cold/slow = 401 redirect 승리 → abort(fail).
#311 warm-up 이 부분완화였던 이유, warm rerun 통과, #313 단독 불충분 모두 설명됨.

## 3. 설계 — A + B 통합 (최소 우아한 근본)

### A — auth-setup 진짜-인증 게이트 (테스트 전용, `e2e/auth/shared.ts`)

- `clickDevFullCrewSignIn` 후, storageState 기록 전, **authed `GET
/v1/users/me/info` HTTP 200** 을 `page.waitForResponse` 로 명시 대기
  (timeout **30s**, **재시도 없음 — fail-loud**).
- 200 수신 후에만 `/parties` 이동·`context.storageState()` 기록.
- 기존 URL-only 3회 재시도 루프 **제거** (URL 도달 ≠ 인증 성공이라 오염 근원).
  sign-in 이 진짜 실패하면 200 미도달 → setup 이 **명시적으로 throw**(CI red),
  사일런트 오염 불가. D-로깅(#311 `page.on('response')`/`requestfailed`)이
  실패 원인을 그대로 표시.
- #311 warm-up 스텝·D-로깅은 **유지**(보완적 완화·진단).

근거: 인증 성공의 행동적 진실원천 = 서버가 세션을 실제 수락한 authed 200.
쿠키 존재만으로는 유효 세션 보장 불가. 재시도 부재는 진짜 회귀를 은폐하지
않기 위함(fail-loud).

### B① — bounded 401 query retry 흡수 (`src/app/_providers/should-retry-query.ts` + `react-query.provider.tsx`)

- 순수 함수 `shouldRetryQuery(failureCount, error)`:
  - `process.env.NODE_ENV === 'development'` → `false`
  - `isForbiddenError(error)` → `false`
  - `isAuthError(error)` → `failureCount <= 2` (최대 2회 재시도 후 확정)
  - 그 외 → `failureCount <= 3`
- `makeQueryClient` 의 `queries.retry` 인라인 람다를 `shouldRetryQuery` import
  로 치환(행위 동등, React/next 디커플로 단위 테스트 용이).
- #313 의 동일 파일을 그대로 흡수(supersede).
- 효과: **보호 라우트**의 일시/cold 첫 `/me` 401 이 _확정 전_ 자가회복 →
  `handleBubbledError`/`ProtectedLayout` 의 spurious redirect 방지(실사용자
  slow/cold + spec cold blip 커버). mutation 미적용(queries 기본 옵션) —
  의도적.

### B② — 전역 public-route redirect 억제 (`react-query.provider.tsx` `handleBubbledError`)

- 현재:
  ```ts
  if (isAuthError(error)) {
    if (location.pathname !== '/' && !location.pathname.startsWith('/link/')) {
      location.href = '/';
    }
    return;
  }
  ```
- 변경: `isAuthError` 분기에서 **데코레이터와 동일 진실원천**
  (`PUBLIC_ROUTE_PREFIXES`, `GUEST_AUTO_LOGIN_ROUTE_PATTERN` from
  `@/entities/me/model/constants`)으로 public/guest-auto-login 경로면 redirect
  하지 않고 return.
  ```ts
  if (isAuthError(error)) {
    const isPublicOrGuestAutoLogin =
      PUBLIC_ROUTE_PREFIXES.some((p) => location.pathname.startsWith(p)) ||
      GUEST_AUTO_LOGIN_ROUTE_PATTERN.test(location.pathname);
    if (
      !isPublicOrGuestAutoLogin &&
      location.pathname !== '/' &&
      !location.pathname.startsWith('/link/')
    ) {
      location.href = '/';
    }
    return;
  }
  ```
- 효과: `/sign-in` 등 public 경로의 사전인증 401 이 sign-in POST 를 abort 하지
  않음. **데코레이터 불일치(`getMyProfileSummary` 누락)를 전역화로
  subsume** — 메서드별 데코레이터 추가(비우아·재발 가능) 안 함.
- 서버 안전: `handleBubbledError` 는 이미 `typeof window === 'undefined'`
  early-return → `location` 접근은 클라이언트 한정. **L3-class 서버버그
  미발생**, task#2(#315 L1 + 데코레이터 `when` predicate L3)와 청정 독립.
- 데코레이터(`@SkipGlobalErrorHandling`)·`when` predicate 는 **무변경**
  (skip-marking 이 통제하는 Dialog 억제 등 다른 용도 보존).

## 4. 데이터 흐름 (수정 후, auth-setup)

1. goto /sign-in → dev-full-crew → `POST /sign/temporary/full-member` in-flight.
2. 동시 사전인증 `/me*` 401:
   - (a) query 경로 → B① bounded retry → 확정 에러 없음.
   - (b) non-skip 401 → handleBubbledError → B② `/sign-in ∈
PUBLIC_ROUTE_PREFIXES` → **redirect 안 함** → POST abort 없음.
3. sign-in POST 완료 → 세션 쿠키 발급.
4. A: `page.waitForResponse(/me/info 200, 30s)` resolve → 인증 입증.
5. goto /parties(authed) → storageState 유효 세션 기록.
6. spec 이 유효 storageState 소비 → `/me` 200 → ProtectedLayout 사이드바
   렌더 → `createPlaylistWithTracks` 통과. #303 근본 해소.

## 5. 에러 처리 / 엣지 (동작 보존)

- 보호 라우트 진짜 미인증: B① 401 ≤2 retry 후 확정 → handleBubbledError
  (public 아님) → `/` redirect (기존 정상 동작 보존). ProtectedLayout 도 확정
  에러 후 동일. 실제 미인증 동작 무변경.
- public 라우트 진짜 미인증: redirect 안 함(의도 — /sign-in 은 로그인 장소).
  pre-B② 의 "로그아웃 유저 /sign-in→/ 바운스" 잠복 UX 버그도 동반 해소.
- `/`·`/link/*` carve-out 보존. 403/5xx/네트워크/mutation 동작 불변
  (B①=queries-only, B②=isAuthError 분기·public gate 만).
- A fail-loud: 진짜 sign-in 실패(실제 회귀) 시 authed-200 미도달 → setup throw
  → CI red + D-로깅 원인 표시. 의도된 동작(사일런트 오염 박멸).

## 6. 테스트 (TDD)

- 단위 `shouldRetryQuery` 7케이스: dev→false / 403→false / 401
  failureCount 0·1·2→true, 3→false / 기타 ≤3→true, 4→false.
- 단위 `handleBubbledError` public-게이트:
  - 401 on `/sign-in`,`/docs`,`/auth/callback`,`/parties/123`(guest-auto-login)
    → redirect 없음.
  - 401 on `/parties`(보호 non-guest) → `/` redirect.
  - `/`·`/link/x` carve-out 유지. non-401(Dialog 분기) 불변. 서버
    (`typeof window === 'undefined'`) early-return 보존. (`location` mock.)
- auth-setup: A 게이트(authed-200 대기) 자체가 오염 방지 아티팩트.
- 전 단위 스위트 GREEN + `tsc --noEmit` + eslint 0 error.
- 실증: post-merge development E2E run 으로 e2e-a/b/d 검증 — 로그에
  `net::ERR_ABORTED POST .../sign/temporary/full-member` **부재** = 근본 제거
  증명. (#303 nature 상 post-merge E2E 가 실질 proof; [[wait-all-ci-incl-e2e-before-merge]].)

## 7. 범위 경계 (명시)

- `@SkipGlobalErrorHandling` 데코레이터·`when` predicate 무변경 → task#2
  (#315 L1 + L3)와 **청정 독립**.
- #311 warm-up·D-로깅 **유지**(보완적 완화·진단; 제거 시 진단력 상실).
- ProtectedLayout **무변경** — B①+B② 로 로드맵-"B"(ProtectedLayout
  loading-vs-unauth) 가 #303 에 불필요(YAGNI). 잔존 보호-라우트 케이스가
  증거로 드러나면 후속 별건.
- `getMyProfileSummary` 에 데코레이터 추가 안 함(B② 가 redirect 관심사를
  전역화로 흡수 — 메서드별 패치는 사용자가 기각한 비우아 경로).

## 8. PR / 이슈 / 추적

- 신규 브랜치 `fix/303-auth-setup-poisoning` (development 기반), 신규 통합 PR.
- #313 의 `should-retry-query.ts` 흡수, **#313 supersede·close**.
- PR 본문: `Closes #312`, `Refs #303` (#303 는 prod ship 시 close 컨벤션).
- 커밋/PR/이슈 코멘트 **한글** ([[feedback_korean_issue_commit_pr]]).
- 푸시 전 논리 단위 커밋 통합 ([[feedback_commit_consolidation_before_push]]).

## 9. 관련 메모리

- [[feedback_root_cause_premature_lock]] — #303 추론 3번째 정정(차등 증거).
- [[feedback_elegant_no_code_dirtying]] — 전역화 subsume(메서드별 패치 회피).
- [[feedback_pr_series_workflow]] · [[feedback_korean_issue_commit_pr]] ·
  [[feedback_commit_consolidation_before_push]] · [[main-squash-merge]].
- [[bugs-roadmap-task-list]] — #303 framing 정정 LIVE 갱신 대상.
