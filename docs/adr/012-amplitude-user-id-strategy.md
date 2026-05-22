# ADR-012: amplitude user_id 전략 (GUEST→MEMBER 경계 연속성)

- **상태**: ✅ **B′ 채택·구현 완료(dev/stg)** — 2026-05-20. 기존 "B→E 단계적"은 **폐기**(아래 §2026-05-20 최종결정). prod 미반영=별도 release 게이트.
- **일자**: 2026-05-18 (B→E 채택) / 2026-05-20 (B′ 로 대체·구현)
- **관련 이슈**: pfplay-web (analytics identity 단절), pfplay-web #320(정정·close), pfplay-web PR #321(B′ 구현, development `539a63d`)
- **관련 노트**: `bugs/2026-05-14-amplitude-user-id-discontinuity.md`, `bugs/2026-05-14-guest-social-promotion-skips-profile-setup.md` (같은 `use-social-sign-in-callback.hook` 공유)

> ## ✅ 2026-05-20 최종 결정: 옵션 B′ 채택 (B→E 폐기)
>
> ### 정정 이력 (정직 기록)
>
> - 2026-05-19 D/#9 P2(옵션 E backend FK) 진입 brainstorm 중, amplitude 콘솔 관찰로 "본 ADR 전제(두 user_id→canonical join) 실측 반증, setUserId 신뢰성 결함" 으로 ADR/#9/로드맵/메모리를 강하게 기재 → **잘못된 lock**. 2026-05-20 확인: 그 근거 데이터는 **~05-17 pre-#310(패치 미적용)** = 본 ADR/#7/#9 가 *고치려던 원본 증상의 재확인*이었지 반증이 아님. 더 최근 데이터선 게스트·멤버 모두 user_id 정상 — 식별 자체는 정상. ([[feedback_root_cause_premature_lock]] 자기적용 사례.)
> - 정정 후 사용자와 재설계: 핵심 요구 = "콘솔 단일 user, **User ID=최신(멤버)**". 옵션 B(#310 canonical pin)는 콘솔 2-user 분리 잔존(B 의 알려진 한계)이라 요구 미충족. 옵션 D(user_account 보존)는 IAM 대수술이라 폐기. 게스트→멤버 도메인 단절(crew/페널티/영구추방 미승계)은 **제품 결정상 의도된 정상 동작**으로 확정(옵션 D·D/#9 P2 backend FK 모두 폐기).
>
> ### 채택: B′ — 게스트는 amplitude 에서 식별하지 않음
>
> 게스트 단계 `setUserId` 미호출(익명·device_id only) → 멤버 인증 시에만 `setUserId(memberUid)` → amplitude **익명→식별 device_id 병합**(SDK 가 지원하는 단일 자동 병합; 두 non-null user_id 병합과 반대)이 직전 게스트 활동을 멤버 user 로 흡수 → **콘솔 단일 user = 멤버(최신 user_id), 가입 전후 연속**. canonical_user_id pin·backend FK 불필요. DB/스키마/백엔드 무변경.
>
> 부수: `User Signed In` 의 `auth_type` 을 stale `me` 가 아닌 콜백 member 권위로 고정(zombie GUEST me 여도 member). 게스트 측 `trackSignedIn(GT)` 은 익명 이벤트로 유지(의도).
>
> ### 구현 (pfplay-web PR #321, development `539a63d`, 2026-05-20)
>
> Task1 canonical_user_id·getCurrentUserId dead-code 제거 + `identifyAuthenticatedUser` 단순화 / Task2 `trackSignedIn` authType 오버라이드 + 콜백 member 고정 / Task3 `AnalyticsProvider` 게스트(GT) 식별 가드. 전 vitest 1279/1279·tsc0·eslint0. spec→plan→subagent-driven TDD(각 2단+최종 holistic 리뷰) 통과. **prod 미반영(별도 release 게이트). post-impl 실증**: stg/amplitude 콘솔에서 게스트→가입 케이스 단일 user=멤버·게스트활동 병합·멤버 SIGNED 에 auth_type:guest 부재 — 머지=stg배포 후 모니터링.
>
> ### B′ 트레이드오프 (수용됨)
>
> 영구 게스트(가입 안 함)는 익명 device user 로 잔존 → 게스트-한정 분석은 user_id 아닌 device/`auth_type` property 기반. 크로스-디바이스 게스트→멤버 연결 불가(비시나리오로 수용). 아래 원본 "B→E" 결정/근거/결과는 **폐기된 기록**으로 보존(맥락·옵션표 참고용).

## 맥락

GUEST 단계에서 OAuth 가입을 거치면 백엔드(`MemberSignService.getMemberOrCreateWithStatus`)가 `new UserId()` 로 **새 `user_account.id`(새 TSID)** 를 발급한다. GUEST 의 synthetic email(`guest-{uid}@guest.local`)은 OAuth real email 과 절대 매칭되지 않아 기존 GUEST row 와 link 가 없다.

프론트의 amplitude 식별(`identifyAuthenticatedUser` → `setUserId(newMemberUid)`)은 **alias / merge / property pinning 호출이 전혀 없다**. 결과:

- amplitude 에서 한 사람이 **두 user (GUEST id / MEMBER id)** 로 영구 분리
- `amplitude.setUserId(Y)` 로 바꿔도 이전 X 에 쌓인 이벤트는 X 에 영구 잔존 (SDK 확정 동작)
- funnel / retention / DAU·MAU 데이터 무결성 손상
- 부가: `User Signed Up` / `User Signed In` 이벤트가 `setUserId` 이전에 발사되어 **GUEST id 로 기록** (가입 funnel 단절)

서비스 동작 자체는 정상 — 순수 analytics 데이터 무결성 문제.

## 선택지

| 선택지                                                           | 설명                                                                                                                             | 트레이드오프                                                                                                                         |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **A** amplitude user_id 불변                                     | 가입 시 `setUserId` 미호출. 첫 GUEST uid 를 영구 amplitude user_id 로 사용, user property 만 갱신                                | 연속성 완벽·가장 깨끗. 단 amplitude id namespace ≠ service id → SQL export 매핑 테이블 필요. 로그인된 채 첫 진입 케이스 별도 처리    |
| **B** user property pinning                                      | `setUserId(newUid)` 경계에서 GUEST id 를 `Identify.setOnce('canonical_user_id', guestId)` 로 GUEST·MEMBER 양쪽 user 에 영구 부착 | 두 user 는 여전히 분리되나 `canonical_user_id` 로 Cohort/SQL join 가능. frontend only·작은 변경. amplitude UI 의 두-user 표시는 잔존 |
| **C** amplitude merge/alias API                                  | 가입 시점 `amplitude.merge`/`alias` 호출                                                                                         | 브라우저 SDK 가 user-merge 를 완전 지원하지 않음 — **미채택** (검증 부담·불확실)                                                     |
| **D** 백엔드 user_account 재사용                                 | OAuth 가입 시 GUEST 의 user_account 를 재사용(providerType/email update + GUEST→MEMBER 전이), id 유지                            | IAM 설계 대수술. schema migration + 기존 코드 광범위 영향 — **미채택** (invasive 과대)                                               |
| **E** 백엔드 `member.previous_guest_user_account_id` FK + B 결합 | 백엔드가 가입 시 직전 GUEST id 를 member row 에 기록, frontend 가 그 값으로 B 수행                                               | 작은 schema migration. canonical link 의 진실원천이 백엔드라 frontend race 에 비의존. 가장 견고한 절충                               |

## 결정

**B → E 단계적 채택.**

- **Phase 1 (B, frontend only, 즉시)**: `identifyAuthenticatedUser` 에서 `setUserId` 직전 현재(GUEST) amplitude user_id 를 캡처하여 GUEST·MEMBER 양쪽에 `setOnce('canonical_user_id', guestId)` pin. 더불어 `User Signed Up/In` 이벤트를 `setUserId` **이후로 재배치**하여 MEMBER user 에 귀속. (#7 zombie-me race 와 같은 `use-social-sign-in-callback.hook` 공유 → 번들 PR)
- **Phase 2 (E, backend, 추후)**: `MemberSignService` 가 가입 시 직전 GUEST `user_account.id` 를 `member.previous_guest_user_account_id`(NULLABLE) 로 기록. frontend canonical pin 의 진실원천을 백엔드로 승격(frontend race·SDK 타이밍 비의존). `bugs/2026-05-14-admin-guest-union-view.md`(#8) 의 어드민 가입 전후 통합뷰와 cross-link 보너스.

C(브라우저 SDK 미지원 불확실), D(IAM 대수술) 미채택.

### 근거

- B 는 frontend-only·저위험으로 데이터 무결성 출혈을 즉시 멈춘다 (canonical join 즉시 가능).
- E 는 canonical link 를 백엔드 진실원천으로 옮겨 frontend race·SDK 로드 타이밍에 비의존하게 견고화한다. schema migration 이 작아 D 대비 위험이 낮다.
- A 는 가장 깨끗하나 amplitude↔service id namespace 분리로 모든 SQL export 에 매핑 비용이 영구 발생 → B/E 의 `canonical_user_id` property join 이 실용적으로 동등하면서 namespace 일관성 유지.

## 결과

- `canonical_user_id` user property 가 GUEST·MEMBER 양쪽 이벤트에 부착 → amplitude Cohort/SQL 에서 한 사람의 가입 전후 행동을 join 가능 (funnel/retention 복원).
- `User Signed Up/In` 이 MEMBER user 에 귀속 → 가입 funnel 정합.
- amplitude UI 상 두 user 분리는 잔존(B 의 알려진 한계) — Phase 2(E) 이후에도 분리는 유지되나 백엔드 권위 link 로 분석 신뢰도 상승. UI 단일화가 필요하면 향후 A 재검토.
- Phase 2 의 `previous_guest_user_account_id` 는 #8 어드민 GUEST 통합뷰의 join key 로도 재사용.
