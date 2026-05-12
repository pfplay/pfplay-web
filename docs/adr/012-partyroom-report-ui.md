# ADR-012: 파티룸 신고 UI 설계 (V13)

- **상태**: 채택
- **일자**: 2026-04 (백엔드 V13 도입 시점에 맞춰 frontend 적용)

## 맥락

백엔드가 V13에서 `partyroom_report` 신고 시스템(Administration BC)을 도입했고, 사용자 측 프론트엔드에서 신고 제출 UI가 필요해졌다 (`POST /api/v1/partyrooms/{partyroomId}/reports`). 신고 처리(상태 전이·후속 조치)는 어드민 콘솔(pfplay-admin)에서 수행되므로, 사용자 측은 **단건 제출 흐름**만 책임진다.

설계상 고려할 지점:

1. **어디서 신고 진입을 노출할 것인가?** — 파티룸 자체에 대한 신고이므로 파티룸 내부 컨텍스트가 자연스러움 (다른 사용자 프로필이 아니라 룸 단위)
2. **신고 카테고리 / 사유는 어디까지 강제할 것인가?** — 백엔드 enum(`ReportCategory`)에 맞춰야 함; 자유 텍스트는 후속 사유 입력 필드로만
3. **사용자가 같은 룸을 여러 번 신고할 수 있는가?** — 백엔드 정책에 따라 결정; 프론트는 응답 코드로 분기

## 결정

`features/partyroom` 슬라이스 내부에 `report` 서브 슬라이스를 만들어 신고 흐름을 격리한다 (다른 룸 액션과 동일한 레벨).

### 진입점

- 파티룸 내부 UI(메뉴 / 컨텍스트 메뉴 / 헤더 등)에서 "이 파티룸 신고하기" 액션을 노출
- 신고 다이얼로그가 열리면 `ReportCategory` 선택 + 자유 사유 입력 → `POST /api/v1/partyrooms/{partyroomId}/reports`

### 슬라이스 구조

```
src/features/partyroom/report/
├── api/   # useReportPartyroom mutation
├── model/ # 폼 schema (Zod, ReportCategory enum)
└── ui/    # 신고 다이얼로그 + 진입 트리거
```

### 응답 처리

- 정상 → 성공 토스트 + 다이얼로그 닫기
- 4xx (중복 신고 등) → 백엔드 errorCode 기반 사용자 친화 메시지로 분기 (`shared/api/http/error/get-error-message.ts`의 패턴 따름)
- 4xx 중 인증 만료 → 전역 인증 핸들러에 위임

### 어드민 측 매핑

- 사용자 신고는 어드민 콘솔의 `/reports` 라우트에서 후속 처리 (pfplay-admin)
- 프론트에는 신고 상태(처리 중 / 처리 완료) 조회 UI 없음 — 일회성 제출

## 결과

- 신고 도입에 들인 UI 표면은 다이얼로그 1개 + 진입 트리거뿐 — yagni 원칙 준수
- `features/partyroom` 슬라이스에 격리되어 다른 룸 액션과 통일된 패턴 유지
- 향후 신고 사유 카테고리 추가 / 사용자 신고 이력 조회 등은 별도 ADR로 다룸

## 관련

- 백엔드 측 schema: pfplay-platform `V13__create_partyroom_report.sql`
- 어드민 측 처리: pfplay-admin `/reports`
- 백엔드 API 분류: pfplay-platform `docs/API_CHANGE_REPORT.md`의 V13 섹션
