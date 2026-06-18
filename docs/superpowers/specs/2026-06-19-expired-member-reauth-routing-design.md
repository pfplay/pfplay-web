# 만료-회원 재인증 라우팅 (Expired-Member Re-auth Routing)

- 날짜: 2026-06-19
- 범위: pfplay-web (프론트엔드)
- 이슈: web #428 (본 작업) · 상위 platform #306 (토큰 만료 split-brain) · 가족 #304 / #303 / web #402
- 상태: 설계 승인됨 (구현 전)

## 1. 배경 / 문제

유저 인증은 `SharedSessionToken` **24h 단일 세션 토큰**이며 **refresh·슬라이딩 갱신·refresh 엔드포인트가 없다**(백엔드 확인: `JwtCookieValidator`는 쿠키 부재/만료/무효를 전부 `Optional.empty()`로 뭉갠다). 프론트 HTTP 인터셉터에도 401 재발급/재시도가 없다.

방 안에서 토큰이 만료되면 `useFetchMe`(GET `/users/me/info`)가 401을 받고, 현재 `useAutoSignInByGuest`가 **모든 401을 게스트 자동 로그인으로 처리**한다. 결과로 **로그인 회원이 조용히 게스트(GT)로 강등**되어 userId가 바뀐다(신원 불연속). 기존 crew/DJ row는 옛 userId에 묶여 있어, 이는 #304(비활성/불일치 크루 명령)·amplitude userId 불연속 계열의 상류 원인이 된다.

핵심: 현재 프론트는 **"만료된 회원"과 "진짜 비로그인 방문자"를 구별하지 못한다**(백엔드가 구별 신호를 주지 않음).

## 2. 목표 / 비목표

**목표**

- 방 안 회원 토큰 만료(상황 C) 시 게스트 강등 대신 **재로그인 유도**(회원 신원 보존).
- **방문자(상황 A: 링크-도메인/딥링크 직접 진입)·게스트 만료(B)의 게스트 자동 로그인은 그대로 유지.**
- 향후 refresh 토큰 도입 시 **무중단 자동 갱신으로 매끄럽게 확장될 단일 재인증 지점**을 깐다.

**비목표 (별도 트랙)**

- ① 백엔드 refresh/슬라이딩 갱신 (platform #306-①; admin `AdminTokenRenewalFilter` 패턴 이식).
- ② WS inbound 만료 검증 ChannelInterceptor (platform #306-②; 핸드셰이크-1회 인증 split-brain).
- web #402 재연결 시 `tryEnter` 재실행.
- ③(본 스펙)은 이들의 **전제 인프라(분류 + 재인증 지점)**만 제공한다.

## 3. 상황 분류 (불변식)

| 상황                                            | 신원 이력   | 기대 동작                 |
| ----------------------------------------------- | ----------- | ------------------------- |
| A. 링크-도메인/딥링크 직접 진입 (무신원 방문자) | 없음        | 게스트 자동 로그인 (유지) |
| B. 게스트(GT) 토큰 만료                         | 게스트뿐    | 게스트 재발급 (유지)      |
| C. 로그인 회원(FM/AM) 토큰 만료                 | 회원 있었음 | **재로그인 유도 (신규)**  |

## 4. 설계

격리된 단위 3개로 구성한다.

### 4.1 신원 기억 — `had-member-session`

- 책임: "이 기기에서 비게스트(FM/AM)로 인증된 적이 있는가"를 기록.
- 동작:
  - `useFetchMe` 성공 + `me.authorityTier ∈ {FM, AM}` → localStorage `pf_had_member_session='1'` 세팅.
  - `me.authorityTier === GT`(게스트) → 세팅하지 않음.
  - 명시적 로그아웃(`useSignOut`) → 플래그 제거.
- 인터페이스: `markMemberSession(authorityTier)`, `hadMemberSession(): boolean`, `clearMemberSession()`.
- **호출 위치**: `markMemberSession`은 `useFetchMe` 성공을 소비하는 곳(예: `parties/layout.tsx`의 기존 `me` effect `:31-38` 옆 `useEffect`)에서 호출. **`use-fetch-me.query.ts`의 `queryFn`/모듈 레벨 `queryOptions`(`:24`)에는 넣지 않는다** — 캐시 레이어를 localStorage에 결합시키지 않기 위함. `clearMemberSession`은 `use-sign-out.mutation.ts`의 `onSettled`(`:8-15`, 이미 Amplitude `setUserId(null)` 정리하는 자리) 옆.
- 선택 이유: boolean 플래그(PII 없음), localStorage라 **새로고침/하드 리로드에도 생존**(만료를 reload 후 알아채도 견고). react-query 캐시 메모리는 리로드에 소실되므로 부적합.

### 4.2 분류·라우팅 chokepoint — `classifyAuthError`

- 책임: 파티룸 컨텍스트의 401을 분류해 게스트/재인증으로 라우팅.
- **통합 지점(정정)**: 실제 chokepoint은 `signInGuest()`의 **유일한 호출처인 `useAutoSignInByGuest`**(`use-auto-sign-in.hook.ts:25`, `parties/layout.tsx:20`에 1회 배선). 본 분류기는 그 훅을 **감싸거나 그 안에서 게이트**한다. (주의: `parties/layout.tsx:26`의 비파티룸 홈 리다이렉트와 `handle-bubbled-error.tsx:30-40`의 `/parties/<id>`·`/link/*` 리다이렉트 **억제 가드는 "중복 분기"가 아니라 보존 대상** — 이 가드들이 in-room에서 분류기가 돌도록 길을 열어준다. "일원화/중복 제거"가 아님.)
- 입력: `{ error, isPartyroomRoute, partyroomId, hadMemberSession }`.
- 규칙:
  - `isAuthError(error)` 아님 → 무시(통과).
  - 파티룸 컨텍스트 + 401:
    - `hadMemberSession === true` → `EXPIRED_MEMBER` → `reauthenticate(returnTo)`.
    - `hadMemberSession === false` → `VISITOR` → `signInGuest()` (기존 동작; 링크-도메인 A 포함).
- **멱등성**: 기존 `attempted` 1회성 ref 가드(`use-auto-sign-in.hook.ts:16,21`)와 동등한 가드를 유지 — `EXPIRED_MEMBER`가 매 렌더마다 `reauthenticate`를 반복 발화하지 않게 한다.
- 출력: 분류 결과(enum) — 라우팅은 호출처(layout/provider)가 수행하거나 훅이 캡슐화.

### 4.3 재인증 지점 — `reauthenticate(returnTo)`

- 책임: 만료-회원을 재인증으로 보냄. **향후 refresh 삽입의 유일한 지점.**
- 오늘(#1): "세션이 만료되었습니다 · 다시 로그인" 안내(모달 또는 로그인 리다이렉트). **현재 룸 URL을 `returnTo`로 보존** → 재로그인 후 동일 방 복귀. **`returnTo`는 휘발성 쿼리(`?source=link` 등)를 제거하고 `/parties/<id>` 경로만 보존** — 재진입 시 일회성 사이드이펙트 재발화 방지.
- in-room 내비게이션 소유: `reauthenticate`는 `/parties/<id>` 안에서 모달/리다이렉트를 수행한다. 이게 가능한 이유는 `handle-bubbled-error.tsx:32-36`이 그 경로의 전역 `/` 리다이렉트를 **억제**하기 때문 → **그 carve-out을 제거하지 말 것**.
- 나중(refresh, 별도): 본 함수 맨 앞에 "조용히 refresh 시도 → 성공 시 무중단 지속(+WS 재연결·재입장) / 실패 시 위 안내로 폴백" 단계 삽입. 4.1·4.2는 변경 없이 재사용.

## 5. 데이터 흐름

```
useFetchMe()
  ├─ 성공 → markMemberSession(me.authorityTier)   // FM/AM만 플래그
  └─ 401  → classifyAuthError({error, isPartyroomRoute, partyroomId, hadMemberSession()})
              ├─ VISITOR         → signInGuest()        (기존)
              └─ EXPIRED_MEMBER  → reauthenticate(returnTo=현재 룸 URL)
useSignOut() → clearMemberSession()
```

분류기는 `signInGuest`의 유일 호출처인 `useAutoSignInByGuest`를 게이트한다(§4.2). `parties/layout.tsx:26`의 비파티룸 홈 리다이렉트와 `handle-bubbled-error.tsx`의 `/parties/<id>`·`/link/*` 억제 carve-out은 **보존**한다(병합·제거 아님) — 전자는 비파티룸 보호, 후자는 in-room 분류기/`reauthenticate` 실행을 가능케 하는 가드.

## 6. 엣지 케이스

- A 링크-도메인 직접 진입: 플래그 없음 → VISITOR → 게스트 로그인. **불변식 보존.**
- B 게스트 만료: GT는 플래그 미세팅 → VISITOR → 재게스트.
- 회원 로그아웃 후 재방문: 로그아웃이 플래그 제거 → VISITOR.
- 회원 로그인 직후 만료(동일 세션): 플래그 존재 → EXPIRED_MEMBER. 정상.
- 플래그 오탐 위험: localStorage는 origin·기기 단위. 재로그인 안내는 비파괴적(사용자가 선택 가능)이라 오탐 비용 낮음.
- WS split-brain(#306-②)·재연결 재입장(#402)은 범위 밖. 단 재로그인으로 새 토큰 발급 시 WS 재연결이 정상화되어 간접 완화.

## 7. 테스트 (TDD)

- 신원 기억: 비게스트 me 성공→플래그 세팅 / 게스트 me→미세팅 / 로그아웃→제거 / reload 후 생존.
- 분류기: (플래그 + 401)→EXPIRED_MEMBER, (무플래그 + 401)→VISITOR, (비401)→무시.
- 통합: 만료-회원 401 → `signInGuest` 미호출 + reauth 발동 / 방문자 401 → `signInGuest` 발동 / 링크-도메인 경로 회귀.
- 멱등성: 만료-회원 상태에서 여러 번 렌더돼도 `reauthenticate`는 **1회만** 발화(1회성 가드).
- `returnTo`: `/parties/5?source=link`에서 만료-회원 401 → `returnTo`가 `?source=link` 제거된 `/parties/5`인지.

## 8. 미해결 / 후속

- `reauthenticate` UX 최종형(전역 모달 vs 로그인 페이지 리다이렉트 + returnTo) — 구현 시 기존 로그인 진입과 정합 맞춰 확정.
- refresh 도입(#306-①) 시 `reauthenticate`에 자동 갱신 단계 삽입 + WS 재연결/`tryEnter`(#402) 연계.
- 백엔드 401 사유 코드(만료 vs 부재) 노출(ii) 추가 시 분류 정밀화(현재는 프론트 신원 기억만으로 충분).
- 참고: `me.authorityTier`를 읽는 다른 경로(`use-fetch-me-async.ts`, `use-is-guest.hook.tsx`)가 있으나, 회원을 게스트로 강등시키는 `signInGuest` 호출처는 `useAutoSignInByGuest` **1곳뿐**이라 분류기 게이트만으로 충분(정보성).
