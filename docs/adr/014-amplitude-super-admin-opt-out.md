# ADR-014: Amplitude super-admin 자동 opt-out

- **상태**: 채택
- **일자**: 2026-05-09 (pfplay-web PR #285에서 ship)

## 맥락

어드민 콘솔(pfplay-admin)이 prod에 진입하면서 super-admin이 사용자 프론트엔드(pfplay-web)에 직접 진입하는 경우가 정기적으로 발생한다 (운영 점검, 사용자 신고 추적, 기능 확인 등). 이 진입은 분석상 **노이즈**다:

- super-admin 1명의 활동이 일반 사용자 N명의 행동 패턴 분석을 오염시킴
- 점검 / 디버깅 동선이 retention / engagement 차트에 섞임
- super-admin이 Sign-In / Partyroom Entered 같은 이벤트를 발행하면 cohort, funnel이 모두 왜곡

Amplitude SDK의 명시적 opt-out 호출이 필요한데, 어드민 측 사용자 ID 발급 정책상 super-admin은 백엔드에서 짧은 `user_id`(5자 미만)로 발급되고 일반 사용자는 항상 5자 이상이다. 이 **숫자 길이 차이가 신뢰 가능한 식별자**가 된다.

## 결정

`user_id`의 길이가 5자 미만이면 super-admin으로 간주하여 Amplitude SDK를 **자동으로 reset + optOut** 한다.

### 동작

- `/me` 응답 또는 인증 store에서 `user_id`를 받으면 길이 검사
- `length < 5`이면:
  1. `amplitude.reset()` — 기존 이벤트 큐와 사용자 식별 정보 비움
  2. `amplitude.setOptOut(true)` — 이후 이벤트 송신 중지
- 5자 이상이면 정상 SDK 초기화 (`setUserId(userId)`)

### 가정

- 일반 사용자 ID는 백엔드 발급 정책상 **항상 5자 이상** (백엔드 변경 시 본 ADR도 갱신 필요)
- super-admin이 일반 흐름으로 로그아웃 → 일반 사용자 로그인 시 SDK 상태가 깔끔히 리셋되어야 함 (`reset()`이 그 역할)

### 검증

- staging에서 super-admin 자격으로 로그인 후 Network 탭에 `api2.amplitude.com` 요청이 추가되지 않는 것 확인 — `amplitude-qa-checklist.md` S30 시나리오

## 결과

- 분석 데이터의 신뢰도 회복 — super-admin 노이즈 제거
- 일반 사용자 행동에는 영향 없음 (5자 이상 정책 가정 유지)
- 백엔드 측 admin 계정 일괄 opt-out(B2, pfplay-platform issue #204)이 별도로 진행 중 — 그 작업이 끝나면 본 클라이언트 측 가드는 안전망 역할로 남음

## 제약 / 잔존 위험

- 백엔드의 ID 발급 정책 변경(예: 일반 사용자도 짧은 ID 사용) 시 본 정책이 일반 사용자도 opt-out시킬 위험
- 정책 변경 시 PR로 본 ADR 갱신 + opt-out 트리거 조건 변경 필요

## 관련

- PR: pfplay-web #285
- 백엔드 후속: pfplay-platform issue #204 (admin 계정 일괄 opt-out, B2)
- QA 시나리오: [amplitude-qa-checklist.md S30](../amplitude-qa-checklist.md)
- 이벤트 분류표: [2026-04-04-event-taxonomy-design.md](../2026-04-04-event-taxonomy-design.md)
