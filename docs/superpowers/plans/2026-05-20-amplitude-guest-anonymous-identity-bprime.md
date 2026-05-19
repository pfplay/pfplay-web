# amplitude 게스트-익명 정체성 (B′) Implementation Plan

> **For agentic workers:** REQUIRED: superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** 게스트를 amplitude 에서 식별하지 않고(익명·device_id only) 멤버 인증 시에만 `setUserId` 하여, 익명→식별 device_id 병합으로 콘솔 단일 user=멤버를 만든다. `canonical_user_id` 패치 제거 + `auth_type:guest` 잔여버그 fix.

**Architecture:** pfplay-web 프론트 한정. (C1) `AnalyticsProvider` 가 게스트(authorityTier=GT) me 에는 식별 스킵, 멤버만 식별. (C2) 소셜 콜백은 `trackSignedIn` 에 명시적 `'member'` authType 오버라이드를 넘겨 stale `me` 의존 제거. (C3) `canonical_user_id`/`getCurrentUserId` dead-code 제거(`events.ts` 타입 포함). DB/백엔드/스키마 무변경.

**Tech Stack:** Next.js App Router, TypeScript, react-query, vitest + RTL, `@amplitude/analytics-browser`.

**Spec:** `docs/superpowers/specs/2026-05-20-amplitude-guest-anonymous-identity-bprime-design.md`
**Branch:** `feature/amplitude-guest-anonymous-bprime` (이미 체크아웃됨, spec 2커밋 존재)

**전역 규약:**

- 각 Task 착수 시 대상 파일을 먼저 `Read`/grep 으로 **현재 라인 확인**(아래 라인번호는 근사치 — 절대 신뢰 말고 grep 으로 앵커 확인 후 편집).
- i18n 무관(이 작업엔 사전 변경 없음). eslint 게이트 `--quiet`(repo 규약). 커밋 메시지 한글. 시크릿 금지.
- 각 Task 끝에서 `yarn tsc --noEmit` 0 + 해당 스코프 `yarn vitest run <경로>` GREEN 후 커밋.

---

## Chunk 1: B′ (C3 → C2 → C1 → 회귀)

> 순서 근거: C3(dead-code 제거·`identifyAuthenticatedUser` 단순화)를 먼저 해야 C2/콜백테스트가 단순화된 함수 위에서 깨끗이 작성됨. 각 Task 는 독립 커밋·전 스위트 GREEN 유지.

### Task 1: C3 — `canonical_user_id`/`getCurrentUserId` dead-code 제거 + `identifyAuthenticatedUser` 단순화

**Files:**

- Modify: `src/shared/lib/analytics/auth-tracking.ts` (`identifyAuthenticatedUser` 본문, `getCurrentUserId` import 제거)
- Modify: `src/shared/lib/analytics/index.ts` (`getCurrentUserId` export + JSDoc 삭제)
- Modify: `src/shared/lib/analytics/events.ts` (`UserPropertySet` 의 `canonical_user_id` 멤버 + JSDoc 삭제)
- Test: `src/shared/lib/analytics/auth-tracking.test.ts` (canonical describe 삭제 + identify 단순화 assert), `src/shared/lib/analytics/index.test.ts` (`getCurrentUserId` describe 삭제)

- [ ] **Step 1: 현행 확인 (편집 전 앵커)**
      Read `auth-tracking.ts`, `index.ts`, `events.ts`. grep 확인:
      `grep -n "getCurrentUserId\|canonical_user_id\|previousUserId\|setOnce" src/shared/lib/analytics/*.ts` (테스트 제외)
      기대: `auth-tracking.ts` 의 `identifyAuthenticatedUser` 가 `getCurrentUserId()` 캡처 + `canonical_user_id` setOnce(게스트측 if-블록 + 멤버측 set/setOnce)를 포함. `index.ts` 에 `getCurrentUserId` export. `events.ts` `UserPropertySet`(또는 해당 타입)에 `canonical_user_id?: string` 멤버 + JSDoc.

- [ ] **Step 2: 실패 테스트 — `identifyAuthenticatedUser` 단순화 계약**
      `auth-tracking.test.ts` 에서: 기존 `canonical_user_id pinning` describe 블록 **전체 삭제**. `identifyAuthenticatedUser` describe 를 아래 계약으로 교체/수정 (analytics index 는 기존 테스트 mock 패턴 그대로):

  - `identifyAuthenticatedUser({ uid: 'u123', authorityTier: AuthorityTier.FM, oauthProvider: 'GOOGLE' })` →
    - `setUserId` 가 `'u123'` 로 1회 호출
    - `identify` 가 `{ set: { auth_type: 'member', authority_tier: AuthorityTier.FM, oauth_provider: 'GOOGLE' } }` 로 1회 호출
    - **`setOnce` 키 없음**, `canonical_user_id` 미등장, `getCurrentUserId` 미호출
  - `oauthProvider` 미전달 시 `set` 에 `oauth_provider` 키 없음
  - GT tier 전달 시 `auth_type:'guest'`(함수는 tier-agnostic 유지 — GT 가드는 본 함수가 아니라 provider 책임[Task 3])

- [ ] **Step 3: 실패 확인**
      Run: `yarn vitest run src/shared/lib/analytics/auth-tracking.test.ts`
      Expected: FAIL (현 구현이 setOnce/canonical 포함)

- [ ] **Step 4: 구현 — `auth-tracking.ts` `identifyAuthenticatedUser` 교체**
      `getCurrentUserId` import 제거(`./index` import 에서 빼기). 함수 본문을 아래로 교체:

  ```ts
  export function identifyAuthenticatedUser({
    uid,
    authorityTier,
    oauthProvider,
  }: IdentifyAuthArgs): void {
    setUserId(uid);
    identify({
      set: {
        auth_type: authTypeOf(authorityTier),
        authority_tier: authorityTier,
        ...(oauthProvider ? { oauth_provider: oauthProvider } : {}),
      },
    });
  }
  ```

  (`previousUserId`/`canonicalUserId`/게스트측 setOnce 블록/멤버측 setOnce 전부 삭제. JSDoc 의 ADR-012 B 언급 주석도 제거 — 현 동작과 불일치 방지.)

- [ ] **Step 5: 구현 — `index.ts` `getCurrentUserId` 제거**
      `getCurrentUserId` export 함수 + 그 위 JSDoc(`현재 amplitude user_id ...`) 삭제. `__resetForTests`/`__preloadSdkForTests` 는 유지.

- [ ] **Step 6: 구현 — `events.ts` `canonical_user_id` 타입 제거**
      `UserPropertySet`(setOnce/set 에 쓰이는 타입) 에서 `canonical_user_id?: string;` 멤버 + 그 JSDoc 삭제. `identify`(index.ts)는 키를 제네릭 순회하므로 런타임 영향 없음 — 타입만 정리.

- [ ] **Step 7: `index.test.ts` 의 `getCurrentUserId` describe 삭제**
      해당 describe/it 블록 전체 삭제(의도된 삭제 — coverage 회귀 아님, spec §테스트 명시).

- [ ] **Step 8: 통과 확인**
      Run: `yarn vitest run src/shared/lib/analytics` → GREEN
      Run: `yarn tsc --noEmit` → 0 (canonical 타입 제거로 깨지는 다른 소비자 없어야 함; 있으면 그 소비자도 dead 이므로 정리)

- [ ] **Step 9: 커밋**
  ```bash
  git add src/shared/lib/analytics/auth-tracking.ts src/shared/lib/analytics/index.ts src/shared/lib/analytics/events.ts src/shared/lib/analytics/auth-tracking.test.ts src/shared/lib/analytics/index.test.ts
  git commit -m "refactor(amplitude): canonical_user_id·getCurrentUserId dead-code 제거 (B′ — 게스트 미식별로 불필요)"
  ```

---

### Task 2: C2 — `trackSignedIn` authType 오버라이드 + 소셜 콜백 member 고정

**Files:**

- Modify: `src/shared/lib/analytics/auth-tracking.ts` (`trackSignedIn` 시그니처)
- Modify: `src/features/sign-in/by-social/lib/use-social-sign-in-callback.hook.tsx` (`trackSignedIn` 호출)
- Test: `src/shared/lib/analytics/auth-tracking.test.ts`, `src/features/sign-in/by-social/lib/use-social-sign-in-callback.hook.test.tsx`

- [ ] **Step 1: 현행 확인**
      grep: `grep -n "trackSignedIn" src/**/*.ts src/**/*.tsx` (테스트 제외) — 호출지: `use-social-sign-in-callback.hook.tsx`(멤버), `use-auto-sign-in.hook.ts`/`by-guest/.../use-sign-in.hook.tsx`(GT). 후자는 **무변경**(오버라이드 미전달 → 기존 동작).

- [ ] **Step 2: 실패 테스트 — `auth-tracking.test.ts` `trackSignedIn` 오버라이드**
      추가:

  - `trackSignedIn(AuthorityTier.GT)` → `track('User Signed In', { auth_type: 'guest' })` (기존 동작 유지 회귀)
  - `trackSignedIn(AuthorityTier.GT, 'member')` → `track('User Signed In', { auth_type: 'member' })` (오버라이드 우선)
  - `trackSignedIn(AuthorityTier.FM)` → `auth_type: 'member'`

- [ ] **Step 3: 실패 확인**
      Run: `yarn vitest run src/shared/lib/analytics/auth-tracking.test.ts` → FAIL (2-arg 미지원)

- [ ] **Step 4: 구현 — `trackSignedIn`**

  ```ts
  export function trackSignedIn(authorityTier: AuthorityTier, authTypeOverride?: AuthType): void {
    track('User Signed In', { auth_type: authTypeOverride ?? authTypeOf(authorityTier) });
  }
  ```

  (`AuthType` 는 이미 `./events` 에서 import 중 — 확인.)

- [ ] **Step 5: 통과 확인** Run: `yarn vitest run src/shared/lib/analytics/auth-tracking.test.ts` → GREEN

- [ ] **Step 6: 실패 테스트 — 콜백 SIGNED_IN auth_type=member 고정**
      `use-social-sign-in-callback.hook.test.tsx`: 기존 :83 부근 "canonical" 관련 테스트는 Task 1 으로 canonical 이 사라졌으니 **개명·정리**(canonical assert 제거). 핵심 신규/수정 계약:

  - `fetchMeAsync` 가 **GT(게스트) me 로 resolve 되는 zombie 시나리오 mock** 에서도, `trackSignedIn` 이 `'member'` 오버라이드로 호출되어 `User Signed In` 의 `auth_type==='member'`.
  - 정상(member me) 시나리오에서도 `auth_type==='member'`.
  - `identifyAuthenticatedUser` 가 member uid 로 호출되는 기존 검증 + #310 zombie-me 방어(`cancelQueries`/`removeQueries`/`fetchMeAsync` 순서) 회귀 유지.

- [ ] **Step 7: 실패 확인** Run: `yarn vitest run src/features/sign-in/by-social` → FAIL

- [ ] **Step 8: 구현 — 콜백 호출 수정**
      `use-social-sign-in-callback.hook.tsx` 에서 `trackSignedIn(me.authorityTier);` → `trackSignedIn(me.authorityTier, 'member');`
      (identify→trackSignedUp→trackSignedIn 순서·zombie-me 방어 라인 무변경.)

- [ ] **Step 9: 통과 확인**
      Run: `yarn vitest run src/features/sign-in/by-social src/shared/lib/analytics` → GREEN. `yarn tsc --noEmit` → 0.

- [ ] **Step 10: 커밋**
  ```bash
  git add src/shared/lib/analytics/auth-tracking.ts src/shared/lib/analytics/auth-tracking.test.ts src/features/sign-in/by-social/lib/use-social-sign-in-callback.hook.tsx src/features/sign-in/by-social/lib/use-social-sign-in-callback.hook.test.tsx
  git commit -m "fix(amplitude): SIGNED_IN auth_type 을 콜백 member 권위로 고정 (stale me 의존 제거)"
  ```

---

### Task 3: C1 — `AnalyticsProvider` 게스트(GT) 식별 가드

**Files:**

- Modify: `src/app/_providers/analytics.provider.tsx`
- Test: `src/app/_providers/analytics.provider.test.tsx` (**신규** — `src/app/_providers/` 엔 `handle-bubbled-error.test.tsx` 만 존재; 그 파일/기존 RTL 컨벤션 미러)

- [ ] **Step 1: 현행 확인**
      Read `analytics.provider.tsx`. 앵커: QueryCache `subscribe` 콜백(게스트/멤버 공통 `identifyAuthenticatedUser({ uid: me.uid, authorityTier: me.authorityTier })`), warm-cache peek(동일), `lastIdentifiedUidRef`, `Session Started`. `AuthorityTier` import 경로 = `@/shared/api/http/types/@enums`.

- [ ] **Step 2: 실패 테스트 — `analytics.provider.test.tsx` 신규**
      RTL + analytics mock(`vi.mock('@/shared/lib/analytics')` 및 `@/shared/lib/analytics/auth-tracking`), react-query `QueryClient`/`QueryClientProvider` 로 `[QueryKeys.Me]` 캐시 주입. 계약:

  - 캐시에 **게스트 me**(`authorityTier: AuthorityTier.GT`) 세팅 → 마운트 후 `identifyAuthenticatedUser` **미호출**(`setUserId` 미호출).
  - 캐시에 **멤버 me**(`AuthorityTier.FM`) 세팅 → `identifyAuthenticatedUser` 1회 호출(uid·tier 전달).
  - **게스트→멤버 전이**: 게스트 me 로 시작(식별 없음) → 같은 캐시키에 멤버 me 로 갱신 → 멤버로 1회 식별.
  - `Session Started` 는 게스트 캐시여도 발사됨(귀속은 무관 — 식별과 분리; `track('Session Started', ...)` 호출 자체는 유지)。
    (기존 `handle-bubbled-error.test.tsx` 의 provider 렌더/mock 패턴을 미러. 새 컨벤션 발명 금지.)

- [ ] **Step 3: 실패 확인**
      Run: `yarn vitest run src/app/_providers/analytics.provider.test.tsx` → FAIL (현재 게스트도 식별)

- [ ] **Step 4: 구현 — GT 가드 (구독 콜백 + warm peek 양쪽)**
      `AuthorityTier` import 추가. 구독 콜백 내부, `if (!me?.uid) return;` 다음에:

  ```ts
  // B′: 게스트는 amplitude 에서 식별하지 않는다(익명·device_id only).
  // 멤버 인증 시 device_id 익명→식별 병합으로 콘솔 단일 user=멤버.
  if (me.authorityTier === AuthorityTier.GT) return;
  ```

  warm-cache peek 분기도 동일 가드 추가(게스트면 `lastIdentifiedUidRef` 갱신·식별 모두 스킵). 예:

  ```ts
  const cached = queryClient.getQueryData<Me.Model>([QueryKeys.Me]);
  if (
    cached?.uid &&
    cached.authorityTier !== AuthorityTier.GT &&
    lastIdentifiedUidRef.current !== cached.uid
  ) {
    lastIdentifiedUidRef.current = cached.uid;
    identifyAuthenticatedUser({ uid: cached.uid, authorityTier: cached.authorityTier });
  }
  ```

  `Session Started`(:28-31 부근)의 `auth_type`/`authority_tier` 속성 부착은 **무변경**(이벤트 속성일 뿐 식별 아님 — spec).

- [ ] **Step 5: 통과 확인**
      Run: `yarn vitest run src/app/_providers/analytics.provider.test.tsx` → GREEN. `yarn tsc --noEmit` → 0.

- [ ] **Step 6: 커밋**
  ```bash
  git add src/app/_providers/analytics.provider.tsx src/app/_providers/analytics.provider.test.tsx
  git commit -m "feat(amplitude): 게스트(GT) amplitude 미식별 — B′ 익명·device_id 병합"
  ```

---

### Task 4: 전 회귀 + scope 검증

- [ ] **Step 1:** `yarn vitest run` 전체 GREEN · `yarn tsc --noEmit` 0 · `yarn eslint src/shared/lib/analytics src/app/_providers src/features/sign-in --quiet` 0 error.
- [ ] **Step 2:** `git diff --stat origin/development..HEAD` — 변경 = analytics(auth-tracking/index/events + tests), analytics.provider(+test), use-social-sign-in-callback(+test), spec/plan 문서 **뿐**. **DB/백엔드/스키마/i18n/기타 도메인 코드 무변경** 확인. `use-auto-sign-in.hook.ts`/`by-guest use-sign-in.hook.tsx` **무변경**(C4) 확인.
- [ ] **Step 3:** `git log --oneline origin/development..HEAD` 로 논리 단위(spec 2 + Task1~3 각 1) 확인.

---

## 완료 정의 (DoD)

- 게스트 me → amplitude 식별 안 됨(setUserId 미호출). 멤버 인증 시에만 `setUserId(memberUid)`. 소셜 콜백 SIGNED_IN `auth_type=member`(zombie me 무관). `canonical_user_id`/`getCurrentUserId`/`events.ts` 타입 dead-code 제거. C4(게스트 trackSignedIn) 무변경.
- 전 vitest GREEN · tsc 0 · scoped eslint 0. 스코프 = pfplay-web 프론트 only(DB/백엔드 0).
- post-merge 실증 검증(stg/amplitude 콘솔: 게스트→가입 케이스 콘솔 단일 user=멤버·게스트활동 병합·멤버 SIGNED 에 auth_type:guest 부재)은 별도 추적(머지=stg 배포).
- **본 PR 머지 후 1회**: ADR-012(상태=B′ 채택, B/E·canonical/Phase2 폐기 사유) · `bugs/2026-05-14-amplitude-user-id-discontinuity.md`(#9) · 로드맵 LIVE · 메모리 정정(thrash 금지 — 머지 후 한 번).

## 범위 밖 (재확인)

DB/스키마/백엔드 · 옵션 D · D/#9 P2 backend FK · crew/페널티/영구추방 연속성 · 크로스디바이스 게스트→멤버 · platform 작업 일체. (제품 결정 = 의도된 단절, 손대지 않음.)
