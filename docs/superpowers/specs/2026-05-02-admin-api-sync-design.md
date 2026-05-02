# Admin API Sync — Design Spec

## Goal

pfplay-admin / 백엔드의 어드민 기능 추가에 따른 서비스 프론트엔드의 sync 작업을 진행한다.
이번 PR의 가시적 변경은 두 가지로 한정한다:

1. ErrorCode enum에 신규 어드민 사이드 이펙트 코드 반영 (CRW-003, CRW-004)
2. CRW-004 (프로필 등록 미완료) 응답에 대한 사용자 안내 알럿 추가

## Scope

### In

- `src/shared/api/http/types/@shared.ts`의 `ErrorCode` enum에 `NOT_PARTYROOM_CREW = 'CRW-003'`, `PROFILE_REQUIRED = 'CRW-004'` 추가
- `src/features/partyroom/enter/lib/use-partyroom-enter-error-alerts.ts`에 `PROFILE_REQUIRED` 핸들러 추가 (alert 다이얼로그)
- i18n 키 `partyroom.ec.profile_required` 추가 (xlsx + generated json)
- 기존 테스트 파일에 CRW-004 케이스 1개 추가

### Out

- HIDDEN displayFlag 처리 — 서비스 측 응답 스키마(`PartyroomElement`)에 `displayFlag`가 없고, 사용자가 비공개 룸을 만들 경로도 없음. 백엔드가 이미 목록에서 제외해줌. → **프론트 변경 없음**
- DJ grade change(`PATCH /partyrooms/{id}/crews/{crewId}/grade`)의 CRW-004 — DJ 버튼은 이미 `useIsGuest` 프리체크 + `informSocialType()`이 1차 방어. 이 경로의 별도 알럿은 후속 PR
- 어드민 전용 enum / 스키마 (PartyroomStatus, displayFlag 등) — 서비스 프론트가 사용하지 않음
- 코드젠 도입 — `docs/TECH_DEBT.md:77` 백로그 항목으로 별도 분리
- partyrooms.ts service/types 추가 변경 — 서비스 측에 신규 엔드포인트 없음

## Decisions

| 항목             | 결정                    | 이유                                                                                                    |
| ---------------- | ----------------------- | ------------------------------------------------------------------------------------------------------- |
| 정렬 방식        | hand-alignment (manual) | 기존 `chore: Swagger 스펙 기준 ... 타입 정렬` 패턴(ba75993) 답습. codegen 도입은 별도 PR                |
| HIDDEN 처리      | 무처리                  | 백엔드가 서비스 목록에서 제외, 사용자가 HIDDEN 룸을 생성할 경로 없음                                    |
| CRW-004 UX       | 단순 alert 다이얼로그   | layout의 `profileUpdated` 가드가 1차 방어, CRW-004는 안전망. 다른 enter 에러들과 일관                   |
| 사전 차단 추가   | 안 함                   | `parties/layout.tsx:33-40`이 `me.profileUpdated === false`면 이미 `/settings/profile`로 자동 리다이렉트 |
| ErrorCode naming | 의미 기반 상수          | 기존 `NOT_FOUND_ACTIVE_ROOM`, `INVALID_ACTIVE_ROOM` 패턴 답습                                           |
| i18n 카피        | 1차안 같이 제출         | xlsx + generated json 함께 커밋해 PR self-contained                                                     |
| 테스트 범위      | 기존 패턴에 케이스 추가 | enum 매핑은 컴파일러가 검증, 행동 테스트만 추가                                                         |

---

## 1. ErrorCode enum 정렬

**파일**: `src/shared/api/http/types/@shared.ts`

```ts
// CrewException
NOT_FOUND_ACTIVE_ROOM = 'CRW-001',
INVALID_ACTIVE_ROOM = 'CRW-002',
NOT_PARTYROOM_CREW = 'CRW-003',     // [추가] 파티룸의 크루가 아닙니다
PROFILE_REQUIRED = 'CRW-004',       // [추가] 프로필 등록이 완료되어야 파티룸에 참여할 수 있습니다
```

CRW-003은 현재 사용처가 없지만 enum sync 차원에서 함께 추가한다 (CRW-004 추가만 하면 003이 빈 갭이 됨).

---

## 2. CRW-004 알럿 핸들러

**파일**: `src/features/partyroom/enter/lib/use-partyroom-enter-error-alerts.ts`

```ts
useOnError(ErrorCode.PROFILE_REQUIRED, () => {
  openAlertDialog({ content: t.partyroom.ec.profile_required });
});
```

기존 핸들러들(NOT_FOUND_ROOM, ALREADY_TERMINATED, EXCEEDED_LIMIT) 옆에 동일한 패턴으로 추가한다.

**마운트 위치 (변경 없음)**: `src/app/parties/layout.tsx:42` — 로비+룸 묶는 상위 layout. enter 호출 후 떨어지는 에러를 layout 레벨에서 수신.

**방어 구도**:

```
[layout.tsx: profileUpdated 가드 → /settings/profile 리다이렉트]
        ↓ (가드 통과)
[enter API 호출]
        ↓ (CRW-004 응답)
[usePartyroomEnterErrorAlerts: alert 다이얼로그 ← 이번 PR에서 추가]
```

---

## 3. i18n 카피

**키**: `partyroom.ec.profile_required`

**카피 1차안** (기존 ec 톤 — `~이에요`/concise English — 답습):

| 언어 | 카피                                             |
| ---- | ------------------------------------------------ |
| ko   | 프로필 등록을 완료해야 파티룸에 참여할 수 있어요 |
| en   | Complete your profile setup to join a partyroom. |

**작업 절차**:

1. `scripts/i18n.xlsx` `i18n` 시트에 `partyroom.ec.profile_required` 키 행 추가 (한국어/영어 컬럼)
2. `yarn i18n` 실행
3. `src/shared/lib/localization/dictionaries/{ko,en}.json` 갱신 결과 함께 커밋

xlsx 편집은 ExcelJS로 스크립트화 (i18n.js의 컬럼 인덱스 약속을 따름).

---

## 4. 테스트

**파일**: `src/features/partyroom/enter/lib/use-partyroom-enter-error-alerts.test.ts`

기존 테스트 케이스(NOT_FOUND_ROOM 등) 옆에 CRW-004 케이스 1개 추가:

```ts
test('CRW-004 발생 시 프로필 안내 alert 다이얼로그를 연다', () => {
  // Arrange: render hook
  // Act: emit ErrorCode.PROFILE_REQUIRED via errorEmitter
  // Assert: openAlertDialog called with t.partyroom.ec.profile_required
});
```

기존 테스트의 setup/mock 패턴을 그대로 따른다.

---

## 검증 (verification)

- `yarn test src/features/partyroom/enter` 통과
- `yarn test:type` 통과 (ErrorCode enum 추가가 다른 곳을 깨지 않는지)
- `yarn lint` 통과
- (수기 확인) i18n 키가 ko/en 양쪽 모두 출력되는지 — 런타임 확인은 ec 다른 키들의 기존 사용으로 검증되었으므로 신규 키만 추가하면 충분
