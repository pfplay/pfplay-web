# 모바일 폼 오버플로우 근본 차단 — 설계

## 배경 / 문제

모바일 뷰포트에서 일부 폼·모달이 가로로 오버플로우한다. 디자인 언어 통일 작업의 e2e 리뷰 중 **생성 다이얼로그(Create Party)** 에서 확인됨: 입력칸이 화면 밖으로 잘림(스크린샷 근거).

**근본 원인** (공용 레이어):

- 공용 `FormItem`이 기본 `layout='horizontal'`로 `grid-cols-[max-content_1fr]` 가로 배치. `1fr` 입력 칼럼이 `min-w-0` 없이는 입력의 min-content 이하로 줄지 않아, 그리드가 패널 콘텐츠 박스 밖으로 visible overflow → 입력칸이 뷰포트 가장자리에서 잘림.
- `Dialog` 패널은 `w-[440px] max-w-full`로 **패널 자체는 이미 뷰포트에 클램프**됨(`max-w-full`). 즉 패널이 아니라 **내부 콘텐츠 오버플로우**가 주범.
- 이 패턴은 공용 `FormItem`을 쓰는 모든 폼(생성·도메인 등 — 모바일/데스크탑 공유)에서 재발 가능.

## 전제 (하드 의존성)

- **#394(모바일 프로필 온보딩) 먼저 dev 머지 후** 그 위에서 진행. #394가 공용 프리미티브에 `min-w-0`을 깔아둔다:
  - `FormItem` children wrapper `min-w-0`
  - `Input` 내부 input `min-w-0`
  - `use-be-a-host` 다이얼로그 `max-w-[calc(100vw-32px)]`, 생성폼 `w-full`+`flex-wrap`, `mobile-profile-edit-form layout='vertical'`
- 본 작업 브랜치는 #394 머지 반영된 development 위로 rebase 후 구현/검증한다. (스펙·플랜 문서는 선작성 가능)
- **플랜의 각 구현 Task 헤더에 "#394 머지+rebase 완료 전제"를 명시** — #394 미머지 상태로 FormItem을 손대면 #394의 `min-w-0` 변경과 충돌하는 diff가 생긴다.
- dev 머지·prod 배포는 사용자 게이트.

## 목표 / 성공 기준

- **모바일 뷰포트(360px 기준)에서 어떤 폼·모달도 가로 오버플로우가 없다.**
- **데스크탑(≥ tablet 브레이크포인트)은 픽셀 단위로 불변.**
- 미래에 새 폼/다이얼로그를 추가해도 공용 프리미티브가 모바일 안전을 자동 보장(재발 0).

## 비목표 (YAGNI)

- 폼의 기능/검증/필드 변경 없음 — **레이아웃(오버플로우)만**.
- 데스크탑 레이아웃 개선/리디자인 없음.
- 모바일 디자인 언어 통일(별도 PR #395) 범위와 겹치지 않음.

## 설계

### ① 반응형 `FormItem` (주 작업)

공용 `FormItem`의 `horizontal` 레이아웃을 **CSS 브레이크포인트 반응형**으로 전환:

- **모바일(< tablet)**: 세로 적층 — 단일 칼럼(`grid-cols-1`), 라벨 좌측정렬(`text-start`), 라벨 아래 입력. (기존 `vertical` 레이아웃과 동일한 시각 형태)
- **데스크탑(≥ tablet)**: 현재 `grid-cols-[max-content_1fr]`(또는 `fit` 시 `max-content`) 가로 배치 + 라벨 우측정렬 — **불변**.
- 구현 방향(정확한 클래스는 플랜/TDD에서 확정):
  - 컨테이너 grid: `grid-cols-1 tablet:grid-cols-[max-content_1fr]` (fit 분기 유지).
  - 라벨 정렬: `text-start tablet:text-right`.
  - `vertical`/`horizontal` 분기에서 가로만 반응형화. `layout='vertical'`을 명시한 호출자는 항상 세로(불변).
  - **에러 행 스페이서 처리**: 현재 `horizontal`+에러 시 빈 `<div>` 그리드 스페이서를 렌더(form-item 81~87행)한다. 단일 칼럼(모바일)에선 이 빈 div가 빈 행으로 보이므로 `hidden tablet:block`으로 모바일에서 숨긴다. 단위테스트 단언도 갱신.
- **라벨 타이포(`type`) 분기는 변경하지 않음** — `type`은 React prop이라 CSS 브레이크포인트로 못 바꿈. 모바일에서도 가로폼의 `body2` 유지(세로 배치에서 자연스러움, 차이 미미). 스크린샷에서 다른 모바일 폼(`detail2`)과 시각적으로 명확히 어긋나면, 그때만 라벨에 반응형 폰트사이즈 className 보정.
- 효과: 공용 FormItem 사용 폼 전체가 모바일에서 자동 세로 → 오버플로우 소멸 + 깔끔한 모바일 레이아웃.

### ② 증거 기반 표면 스윕 + 조건부 Dialog 클램프

대상 표면을 **360px에서 실제 재현 → 근본 원인 확인 → 수정 → 재검**:

- 대상: 생성 다이얼로그(Create Party), 버그신고 다이얼로그, 프로필(모바일 폼 + 데스크탑 ProfileEditForm V1의 모바일 도달 여부 확인), 사인인, 도메인 선택, 플레이리스트 폼(이미 `vertical`).
- ①(반응형 FormItem) + #394(`min-w-0`)로 해소되면 해당 표면은 추가 작업 없음. (예: 사인인 페이지는 이미 `tablet:` 반응형 클래스를 일부 쓰므로 ①로 자동 커버될 가능성 높음 — 스윕 시 확인.)
- **패널 자체가 뷰포트를 초과하는 케이스가 남는 경우에만** 그 표면(또는 공용 `Dialog` 베이스)에 `max-w-[calc(100vw-2rem)]` 보강. 무분별한 전역 추가 금지.
- 데스크탑 ProfileEditForm V1(`w-[550px]` 하드코딩 입력)이 모바일에서 도달 불가하면 범위 제외(확인 후 결정).

### ③ #394 중복 핵 정리 (표면별 검증 게이트)

①·#394로 불필요해진 per-form 핵을 정리(코드 더럽힘 회피):

- 후보: `use-be-a-host` 다이얼로그 `max-w` / 생성폼 `flex-wrap` / `mobile-profile-edit-form layout='vertical'`.
- **각 핵은 "그 표면을 공용 수정이 덮는다"를 모바일 스크린샷으로 확인한 뒤에만 제거.** 못 덮는 게 있으면 남기고 사유 기록.
- (#394 머지 후 development 위에서 작업하므로 #394 코드 수정은 안전.)

## 검증

- **단위테스트**: `FormItem`이 반응형 클래스(`grid-cols-1 tablet:grid-cols-[...]`, `text-start tablet:text-right`)를 렌더하는지 단언. `layout='vertical'` 호출자는 세로 불변 단언. 기존 FormItem/Input 테스트 무수정 통과.
- **e2e 스크린샷**: 백엔드 docker + `npx next dev`. 모바일(360px) + 데스크탑(1440px) 양쪽으로 각 폼 캡처:
  - 모바일: 가로 오버플로우 0(입력칸 잘림 없음).
  - 데스크탑: 변경 전/후 동일(불변 육안).
- 전체 `yarn test` / `yarn test:type` / `yarn lint` GREEN.
- [[feedback_local_e2e_before_dev_merge]] · [[feedback_elegant_no_code_dirtying]] · [[reference_pfplay_web_local_e2e_run]] · [[reference_pfplay_web_local_dev_http_webpack]] 준수.

## 리스크 / 완화

- **공용 컴포넌트(FormItem) 변경 → 회귀 범위 넓음**: 브레이크포인트 게이트로 데스크탑(≥tablet) 불변 보장 + 데스크탑 스크린샷으로 검증. FormItem을 쓰는 모든 폼을 모바일/데스크탑 양쪽 캡처로 확인.
- **tablet 브레이크포인트 토큰 확인 필요**: `px-app`이 모바일 `px-20` / `tablet:px-40`을 쓰므로 tablet이 모바일↔데스크탑 경계. 플랜에서 정확한 토큰 재확인.
- **#394 미머지 상태로 구현 착수 위험**: 구현은 #394 머지+rebase 후. 스펙/플랜만 선행.
