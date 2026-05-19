# amplitude 게스트-익명 정체성 (옵션 B′) 설계

- **상태**: 설계 확정 (사용자 결정 완료) — spec 리뷰 대기
- **일자**: 2026-05-20
- **관련**: ADR-012(전제 정정됨), `bugs/2026-05-14-amplitude-user-id-discontinuity.md`(#9), pfplay-web #320(정정·close), web #310(Phase1 B — 본 설계가 일부 대체)
- **범위**: pfplay-web 프론트 한정. **DB·백엔드·스키마 무변경.**

## 맥락 / 문제

OAuth 가입 시 백엔드는 **새 `user_account`(새 TSID)** 를 발급한다(합성 게스트 email ≠ OAuth email → 재사용 경로 없음 — 이는 **의도된 설계**, 정정 확인됨). 현재 프론트(`AnalyticsProvider`)는 게스트 me(authorityTier=GT)에도 `setUserId(guestUid)` 를 호출해 **게스트를 별도 amplitude user 로 식별**한다. 가입 후엔 멤버 user_id 로 또 식별 → amplitude 콘솔에 **한 사람이 2개 user 아이템**(게스트 user_id / 멤버 user_id)으로 분리. 두 개의 서로 다른 non-null user_id 는 amplitude 가 자동 병합하지 않는다(ADR-012 인용 SDK 사실).

옵션 B(web #310: 게스트·멤버 모두 식별 + `canonical_user_id` setOnce pin)는 Cohort/SQL **조인 키**만 제공할 뿐 **콘솔 UI 는 여전히 2 아이템**(ADR-012 자인한 한계). 제품 요구 = "한 사람 = 한 아이템, **콘솔 User ID = 최신(멤버)**".

## 결정 (사용자 확정)

**옵션 B′ — 게스트는 amplitude 에서 식별하지 않는다.**

- 게스트 단계: `setUserId` **미호출**. 게스트 활동 = `device_id` only = 익명 이벤트.
- 멤버 인증(소셜 로그인) 시점에만 `setUserId(memberUid)`.
- amplitude 의 **익명→식별 자동 병합**(동일 `device_id` 의 직전 익명 이벤트를 새 user_id 로 흡수 — 두 non-null user_id 병합과 반대, SDK 가 지원하는 단일 자동 병합)이 게스트 활동을 멤버 user 에 접합.
- 결과: 콘솔 단일 user = 멤버 id, 게스트 활동 포함. **DB/스키마 무변경, canonical property 불필요.**

### 명시적으로 범위 밖 (제품 결정 — 의도된 동작, 고치지 않음)

- 가입 시 새 `user_account_id` 생성 = 의도. **crew_id 단절·페널티/영구추방 미승계 = 정상 동작**(사용자 명시 수용). 옵션 D(DB 정체성 보존) 폐기.
- 크로스-디바이스 게스트→멤버 연결 = 비시나리오(수용). 영구 게스트(가입 안 함) = 익명 device user 로 잔존(수용 — "익명은 추적 불요").
- 백엔드 `member.previous_guest_user_account_id`(구 D/#9 P2) = 불필요·폐기.

## 아키텍처 / 컴포넌트

### C1. `AnalyticsProvider` — 게스트 식별 가드 (핵심 변경)

`src/app/_providers/analytics.provider.tsx`

- `/me` 캐시 구독 콜백(:48 근처)과 warm-cache peek(:55 근처) 양쪽에서, `identifyAuthenticatedUser(...)` 호출 **전에 `authorityTier === AuthorityTier.GT` 이면 식별 스킵**(setUserId/identify 미수행). 멤버(FM/AM 등 비-GT)만 식별.
- `lastIdentifiedUidRef` 가드 의미 유지(멤버 uid 변경 시 1회 식별). 게스트는 ref 갱신도 하지 않음(이후 멤버 전이 시 정상 식별되도록).
- `Session Started`(:28-34): 변경 없음. 게스트/콜드 시 익명 device 이벤트로 발사(수용 — 세션 신호; identity 는 device_id 병합으로 사후 정합). 멤버 warm 캐시 시 기존대로 auth_type 부착.

### C2. 소셜 콜백 — 멤버 식별 유지 + `auth_type` 권위출처 도출

`src/features/sign-in/by-social/lib/use-social-sign-in-callback.hook.tsx`, `src/shared/lib/analytics/auth-tracking.ts`

- 멤버 식별 지점(:45)·#310 의 zombie-me 방어(`cancelQueries`+`removeQueries`+`fetchMeAsync`)·track 재배치(identify→trackSignedUp/In) **유지**.
- **잔여 명시버그 fix (구체 메커니즘 명시)**: 현재 `trackSignedIn(me.authorityTier)` 는 `fetchMeAsync()` 결과에서 tier 를 읽는다 — zombie-me 레이스로 그 `me` 가 게스트로 resolve 되면 `User Signed In {auth_type:guest}` 가 샌다. **콜백 경로는 정의상 member 인증 완료이므로 `me` 의존을 끊는다.** 구체 변경: `trackSignedIn` 에 명시적 `authType` 오버라이드 인자를 추가(예: `trackSignedIn(authorityTier, authTypeOverride?: AuthType)`)하고, 소셜 콜백에서는 `trackSignedIn(me.authorityTier, 'member')` 로 호출(또는 콜백 전용 member-고정 상수로 `authTypeOf` 우회). 즉 SIGNED 이벤트의 `auth_type` 은 `fetchMeAsync` 결과와 **분리**되어 이 경로에서 항상 `member`. `trackSignedUp` 은 tier 미사용이라 무변경(단 setUserId 후 발사 순서 유지로 멤버 user 귀속). 다른 호출지(`use-auto-sign-in`/`use-sign-in` 의 `trackSignedIn(GT)`)는 오버라이드 미전달 → 기존대로 `authTypeOf(GT)='guest'`(게스트 익명 이벤트, 정상).

### C3. `identifyAuthenticatedUser` — canonical pin 제거 (B′ 로 불필요)

`src/shared/lib/analytics/auth-tracking.ts`

- B′ 에선 게스트가 식별되지 않으므로 `getCurrentUserId()`(이전 게스트 id 캡처)·`canonical_user_id` setOnce(게스트/멤버 양쪽 pin) 로직은 **무의미 → 제거**. 함수는 멤버 `setUserId(uid)` + user property(`auth_type`, `authority_tier`, `oauth_provider`) set 으로 단순화.
- **제거 surface (확정)**: `auth-tracking.ts` 의 `previousUserId`/`canonicalUserId` 캡처·게스트측 setOnce·멤버측 setOnce(:22-33,:42 영역) · `index.ts` 의 `getCurrentUserId` export(소비자 0 — 검증됨) + 그 단위테스트(`index.test.ts` `getCurrentUserId` describe) · **`events.ts` 의 `UserPropertySet.canonical_user_id?: string` 멤버 + 그 JSDoc(:100-104 영역)** — dead 가 되므로 동반 제거(스펙 일관 — 잔여 dead-code 금지). SDK-load race(`!sdk`→undefined) 복잡성도 canonical 제거로 동반 소거.

### C4. 게스트 측 이벤트 (`trackSignedIn(GT)`)

`use-auto-sign-in.hook.ts`, `by-guest/lib/use-sign-in.hook.tsx`

- 게스트 `trackSignedIn(AuthorityTier.GT)` 는 **이벤트일 뿐 setUserId 아님** → B′ 에서 익명 device 이벤트로 발사됨(수용). 변경 없음(유지). `auth_type:guest` 는 이벤트 속성으로 정상(게스트 세션의 사실 기록).
- (대안 — spec 리뷰서 판단: 게스트 SignedIn 을 아예 발사하지 않음. 기본안 = **유지**(익명 세션 신호 가치 > 노이즈). 변경 최소 원칙.)

## 데이터 흐름 (B′ 정상 경로)

```
[게스트 진입] device_id=D, user_id=∅
  → 게스트 활동 이벤트들: (D, user_id 없음) = 익명
[소셜 로그인 콜백] member 쿠키 → fetchMeAsync(member)
  → setUserId(memberUid)   (C2, reset() 없음 → device_id=D 유지)
  → amplitude: D 의 직전 익명 이벤트 ⟶ memberUid 로 귀속(병합)
  → trackSignedUp/In (auth_type=member, C2)
[결과] 콘솔: user 1개 = memberUid, 게스트활동 포함. 최신 User ID=member.
```

## 에러 / 엣지

- **device_id 안정성**: sign-out=`sdk.setUserId(undefined)`(reset 아님, device_id 보존). `resetAnalyticsUser()` app 호출 0. `!isValidAmplitudeUserId`→reset 은 게스트 미식별이라 정상 흐름 미진입(멤버=유효 TSID; super-admin id=1 는 기존 별도 처리). → 병합 깨는 reset 경로 없음(검증 완료).
- **멤버 재로그인/신규 디바이스**: 매 세션 `setUserId(member)` — 정상(병합 무관, 동일 user_id).
- **로그아웃 후 같은 디바이스 새 게스트**: 익명 복귀. 이후 다른 멤버로 가입 시 그 멤버로 device 병합 — 제품상 수용(비시나리오/허용).
- **영구 게스트**: 익명 device user 잔존 — 수용. 게스트-한정 분석은 user_id 아닌 device/`auth_type` 이벤트속성 기반.
- **SDK 미로드 중 track**: 기존 `pendingActions` 큐로 순서 보존. B′ 는 canonical 캡처 제거로 `!sdk`→undefined race 노출면 축소.

## 테스트

- `AnalyticsProvider`: 게스트 me(GT) → `setUserId`/`identify` **미호출**(스킵) / 멤버 me → 1회 식별 / 게스트→멤버 전이 시 멤버 식별 발생. (RTL + analytics mock, 기존 컴포넌트 테스트 컨벤션.)
- `auth-tracking`: 단순화된 `identifyAuthenticatedUser` = 멤버 setUserId + property only, canonical/getCurrentUserId 미사용. `authTypeOf` 회귀.
- 소셜 콜백: SIGNED 이벤트 `auth_type=member`(게스트 me 늦게 resolve 시나리오 mock 으로도 member 고정 — 새 `authType` 오버라이드 경로) + #310 zombie-me 방어 회귀 유지.
- **삭제 항목 명시(회귀 오인 방지)**: `auth-tracking.test.ts` 의 `canonical_user_id pinning` describe(≈:108-145)·`index.test.ts` 의 `getCurrentUserId` describe(≈:187-195)·`use-social-sign-in-callback.hook.test.tsx:83` 의 "canonical" 테스트명 — B′ 로 **의도된 삭제/개명**(coverage 회귀 아님, 리뷰어 안내용). `auth-tracking.ts` 의 `identifyAuthenticatedUser` 는 tier-agnostic 유지(GT 가드는 provider 에만 — C1; 함수에 밀어넣지 않음).
- **net-new**: `AnalyticsProvider` 테스트 파일 신규(`src/app/_providers/` 엔 현재 `handle-bubbled-error.test.tsx` 만 존재) — 기존 RTL 컨벤션 미러.
- 전 vitest·tsc·scoped eslint green.

## 검증 (post-implementation, 실증)

stg(머지 후) 또는 amplitude 콘솔: ① 게스트로 활동 후 소셜 가입한 케이스가 **콘솔 단일 user=멤버**, 게스트 활동 그 안에 병합 ② 멤버 SIGNED 이벤트에 `auth_type:guest` 부재 ③ 게스트 전용 세션은 익명 device user(정상). 콘솔 미정합 시 device_id 안정성/병합 거동 재조사(추측 fix 금지).

## DoD

- C1~C3 구현 + 테스트 green, 스코프=프론트 only(DB/백엔드 0).
- 본 PR 머지 후 **1회**: ADR-012(상태=옵션 B′ 채택, B/E·canonical/Phase2 폐기 사유 명기) · #9 노트 · 로드맵 LIVE · 메모리 정정(thrash 금지 — 머지 후 한 번).
- post-impl 검증 항목은 별도 추적(머지=stg 배포라 모니터링).

## 범위 밖 (재확인)

DB/스키마/백엔드 변경 · 옵션 D · D/#9 P2 backend FK · crew/페널티/영구추방 연속성 · 크로스-디바이스 게스트→멤버 · platform 측 작업 일체.
