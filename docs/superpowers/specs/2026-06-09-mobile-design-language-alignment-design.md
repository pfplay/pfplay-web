# 모바일 디자인 언어 통일 (Mobile Design-Language Alignment) — 설계

- 날짜: 2026-06-09
- 상태: 설계 확정 대기 (brainstorming 산출물)
- 레포: `pfplay-web`
- 관련: 모바일 반응형 chunk 1~6 (#340 계열), 모바일 강제 프로필 온보딩 (#394, 별개 PR)

## 1. 목표

pfplay-web의 모바일 웹 뷰(`src/widgets-mobile/`, `src/features-mobile/`)를
데스크탑(브라우저) 버전의 **시각 디자인 언어**로 통일한다. 사용자가 웹과 모바일을
오갈 때 "같은 서비스"라는 일관된 인상을 받도록, 모바일에 남아 있는 기능적 축소판
느낌(이모지/ASCII 아이콘, raw `<p>`, 비례 없는 빡빡한 여백)을 데스크탑의
정제된 비주얼(PF 아이콘 · Galmuri 타이포 · 마퀴 · 패널 크롬 · 여백 리듬)로 끌어올린다.

## 2. 비목표 (Non-goals)

- **레이아웃 재설계 아님.** 데스크탑 룸은 시네마 레이아웃(중앙 전광판 + 좌 사이드바 +
  우 400px 채팅 패널)이라 폰에 그대로 못 올린다. 모바일은 **네이티브 레이아웃(탭·시트)을 유지**하고,
  옮기는 것은 **시각 언어(아이콘·타이포·색·크롬·여백)뿐**이다.
- **데스크탑 동작/렌더 변경 아님.** 공용 프리미티브는 재사용/추가만. 데스크탑 출력은 불변.
- **신규 기능 아님.** 새 화면/플로우/엔드포인트 없음. 순수 시각 리터치.
- **prod 배포 아님.** dev 머지조차 사용자 게이트.
- **신규 아이콘 제작 아님.** 필요한 PF 글리프는 전부 `src/shared/ui/icons/`에 이미 존재.

## 3. 잠긴 결정 (brainstorming)

| #   | 결정                                                                                            | 근거                             |
| --- | ----------------------------------------------------------------------------------------------- | -------------------------------- |
| D1  | 충실도 = **디자인 언어만 이식**, 레이아웃은 모바일 네이티브 유지                                | 시네마 레이아웃은 폰 폭에 부적합 |
| D2  | 범위 = **전 화면 홀리스틱 리터치** (룸·로비·시트·검색·폼)                                       | 사용자 "전부 다 리터치"          |
| D3  | 시그니처 요소 **전부 채택**: ①PF 아이콘 ②Galmuri 타이포 ③긴 제목 마퀴 ④패널 크롬 + 여백·색 정합 | 데스크탑 정체성                  |
| D4  | 실행 = **얇은 모바일 비주얼 킷(A1~A5) + 단계적 적용** (Room→Lobby→Sheets→Forms)                 | 위험 분산, 단계별 실측           |
| D5  | 여백 = 데스크탑 px 복사 ❌, **같은 비율을 모바일 폭에 맞게 환산**                               | 폭이 다름                        |
| D6  | 데스크탑 렌더 불변, 단위테스트 GREEN + 로컬 풀스택 e2e 스크린샷, prod 배포 안 함                | 표준 게이트                      |

## 4. 현재 상태 (갭, 시각 영향 순)

실측(2026-06-09) 기준:

1. **탭바** `widgets-mobile/partyroom-room-tabs/ui/parts/tab-bar.component.tsx` — 3버튼 `💬 채팅` / `👥 {crewCount}` / `🎧 {queueCount}`, 이모지 프리픽스 + raw 텍스트 라벨, PF 아이콘 없음
2. **now-playing** `widgets-mobile/partyroom-display-board/ui/parts/now-playing-meta.component.tsx` — **prop 구동**(`trackName`/`djNickname`/`duration` props, parent 책임). 트랙명 raw `<p>`(text-base font-semibold), DJ는 🎧 이모지 + xs 텍스트. 데스크탑 `VideoTitle`은 Galmuri + 마퀴(스토어 직독)
3. **룸 헤더** `widgets-mobile/partyroom-display-board/partyroom-display-board.component.tsx:60-77` — ASCII ←/⋮ raw 텍스트, `<h1>` raw
4. **검색 리스트** `features-mobile/playlist/add-tracks/ui/search-list-item.component.tsx` — ASCII ▶ / [+] TextButton, 아이콘 없음
5. **시트 헤더** `widgets-mobile/partyroom-djing-sheet/ui/fullscreen-sheet.component.tsx` — **이미 `PFArrowLeft`/`PFClose` 사용**(모바일 유일 PF 적용처). 타이틀은 raw `<h2>`. → 이 패턴을 표준 컴포넌트로 승격
6. **여백** 전반적으로 비례 없이 빡빡 (px-3~4 / gap-3 vs 데스크탑 px-7/py-6/gap-24의 비례)
7. **로비 카드** `features-mobile/partyroom/list/partyroom-card.component.tsx` — 일부 Typography 사용(유지), 썸네일 비율·여백 정합 대상

> 요지: 모바일 = 데스크탑 디자인 언어가 벗겨진 "기능적 축소판".

## 5. 섹션 A — 모바일 비주얼 킷

데스크탑 시각 언어를 모바일에 이식하는 **얇은 공용 레이어**. 전부 "추가 또는 재사용",
데스크탑 렌더 불변. 신규 공용 컴포넌트는 `src/shared/ui/components/<name>/`에
(`index.ts` + `<name>.component.tsx` + `<name>.component.test.tsx`) 패턴으로 둔다.

### A1 — 아이콘 일괄 교체 (이모지/ASCII → PF)

- 탭바·헤더·시트·검색의 이모지/raw 글리프를 기존 PF 컴포넌트로 교체.
- 매핑: 💬(탭 채팅)→`PFChatFilled`/`PFChatOutline`, 👥(탭 크루)→`PFPersonFilled`/`PFPersonOutline`,
  🎧(탭 큐)→`PFHeadset`, ←→`PFArrowLeft`, ⋮→`PFMoreVert`, ▶(검색 재생)→`PFPlayCircleFilled`,
  [+](검색 추가)→`PFAdd`, ✕→`PFClose`. (🎧 now-playing DJ 프리픽스도 `PFHeadset`)
- 전부 `src/shared/ui/icons/`에 존재 확인됨. 신규 제작 0. (📥/`PFPlaylistAdd`는 현재 탭바에 없음 — 매핑 제외)

### A2 — `TrackTitle` 공용 컴포넌트 (Galmuri + 마퀴)

- 데스크탑 `widgets/partyroom-display-board/ui/parts/video-title.component.tsx`의
  **프레젠테이션**(`Marquee delay=4 speed=20 gradientWidth=0` + `Typography type='body3'`
  - `cn(galmuriFont.className, 'text-white leading-none')`, empty 시 `caption1`)을
    `src/shared/ui/components/track-title/`로 추출한다.
- **데스크탑 렌더 불변 보장 방식**: `TrackTitle`은 순수 프레젠테이션(props: `name?: string`, `emptyText: string`).
  데스크탑 `VideoTitle`은 **스토어 와이어링과 i18n을 그대로 유지**한 채 `TrackTitle`에 위임 → DOM/클래스 바이트 동일.
  기존 `video-title` 테스트가 회귀 가드.
- **양 분기 모두 보존 필수**: filled = `Marquee className='z-0'` 안 `Typography type='body3'` + `data-testid='video-title'`,
  empty = `Typography type='caption1'` + `data-testid='video-title-empty'`. 두 `data-testid`가 다르므로
  `TrackTitle`이 분기별 testid를 그대로 출력해야 기존 데스크탑 테스트가 무수정 통과.
- 모바일 `now-playing-meta`는 **prop 구동**(스토어 직독 아님)이므로 `TrackTitle name={trackName}`로
  연결한다(데스크탑처럼 스토어로 재배선하지 않음 — prop 형태 유지). 결과 비주얼은 동일.

### A3 — `MobileSheetHeader` / 룸 헤더 표준화

- 시트·룸 상단 헤더 표준 컴포넌트: 좌측 leading 슬롯(`PFArrowLeft`|`PFClose`),
  중앙 `Typography` 타이틀, 우측 trailing 슬롯(`PFMoreVert` 등).
- **기준 패턴 = 이미 존재하는 `fullscreen-sheet`의 헤더**(PF 아이콘 + `h-[56px]` +
  `border-b border-gray-800`). 이를 컴포넌트로 승격해 룸 디스플레이보드 헤더와 통일.
- 위치: `src/shared/ui/components/mobile-sheet-header/` (모바일 전용이나 공용 디렉터리 컨벤션 따름).

### A4 — `MobileTabBar` 리스타일

- PF 아이콘 + `Typography` 라벨. 활성 = 레드 강조 + 언더라인 결(데스크탑 강조 체계),
  비활성 = `text-gray-400`. iOS HIG(`min-h-[44px]`, `pb-[env(safe-area-inset-bottom)]`) 유지.
- 기존 `tab-bar.component.tsx`를 리스타일(구조 유지, 시각만 교체).

### A5 — 패널 크롬 토큰 + 여백 리듬

- 데스크탑 패널 프레이밍(`bg-black` + `border border-gray-800` + 라운드/프레이밍)과
  모바일 여백 리듬을 정합. raw `<p>` → `Typography` 정리.
- 여백은 px 복사가 아니라 **비율 환산**(D5). 모바일 표준 리듬을 정의(예: 컨테이너 가로
  `px-app`, 섹션 간 `gap`/`py`를 데스크탑 비례에 맞춰 한 벌로 통일). Tailwind 네이티브 클래스 사용
  (theme는 색만 토큰, 여백은 native scale).

## 6. 섹션 B — 화면별 적용

| 화면                 | 파일                                                                                   | 적용 킷 | 변경                                                          |
| -------------------- | -------------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------- |
| 탭바                 | `widgets-mobile/partyroom-room-tabs/ui/parts/tab-bar.component.tsx`                    | A1·A4   | 이모지→PF, raw→Typography, 활성 레드+언더라인                 |
| 룸 헤더              | `widgets-mobile/partyroom-display-board/partyroom-display-board.component.tsx`         | A1·A3   | ASCII ←/⋮→PF, `<h1>`→Typography, `MobileSheetHeader` 적용     |
| now-playing          | `widgets-mobile/partyroom-display-board/ui/parts/now-playing-meta.component.tsx`       | A1·A2   | 트랙명→`TrackTitle`, 🎧→`PFHeadset`                           |
| 채팅 패널            | `widgets-mobile/partyroom-chat-panel/**`                                               | A5      | 크롬/여백 정합(이미 Typography·PFSend 사용분 유지)            |
| 로비 리스트/카드     | `features-mobile/partyroom/list/*`, `create/ui/card.component.tsx`                     | A1·A5   | 썸네일 비율·여백 리듬·카드 크롬                               |
| DJ/플레이리스트 시트 | `widgets-mobile/partyroom-djing-sheet/ui/*`                                            | A3·A5   | 헤더 `MobileSheetHeader` 추출 적용(기존 PF 보존), 리스트 여백 |
| add-tracks 검색      | `features-mobile/playlist/add-tracks/ui/{music-search,search-list-item}.component.tsx` | A1·A5   | ASCII ▶/[+]→PF, 여백 정합                                    |
| 폼                   | `features-mobile/profile/ui/mobile-profile-edit-form.component.tsx`                    | A5      | 라벨 Typography·여백 리듬(기능 불변)                          |

## 7. 섹션 C — 단계 & 검증

### 단계

1. **킷 우선** — A1~A5 공용 컴포넌트/토큰 추가. 데스크탑 영향 0 (단, A2는 데스크탑
   `VideoTitle` → `TrackTitle` 위임 추출이라 기존 테스트로 렌더 불변 검증).
2. **Room → Lobby → Sheets → Forms** 순으로 단계 적용.
3. 각 단계마다: co-located vitest GREEN + 로컬 풀스택 e2e 스크린샷 실측.

### 검증 게이트 (각 단계 + 최종)

- `yarn test` (vitest, co-located `*.test.tsx`) 전부 GREEN
- `yarn test:type` (tsc --noEmit) 클린
- lint 클린
- **데스크탑 회귀**: A2 등 공용 추출분은 데스크탑 화면 스크린샷 전/후 대조로 렌더 불변 확인
- **모바일 실측**: `scripts/capture-mobile-screens.mjs`로 단계별 스크린샷(iPhone13 컨텍스트),
  변경 전/후 시각 비교
- 로컬 풀스택 e2e: backend docker(:8080) + `npx next dev`(:3000) — `[[reference_pfplay_web_local_e2e_run]]`,
  `[[reference_pfplay_web_local_dev_http_webpack]]` (yarn dev 금지)
- 최종: dev 머지 = **사용자 게이트**, prod 배포 안 함

### 테스트 전략

- 신규 공용 컴포넌트(`TrackTitle`/`MobileSheetHeader`/`MobileTabBar`)는 co-located vitest로
  렌더·prop·접근성(아이콘 aria/label) 단위 테스트.
- 기존 데스크탑 `video-title` 테스트는 A2 추출의 회귀 가드로 유지(수정 없이 통과해야 함).
- 시각 자체는 자동 단언 불가 → 스크린샷 실측이 1차 검증(스냅샷 테스트는 도입하지 않음, 노이즈 큼).

## 8. 위험 & 미해결 (구현/플랜 단계에서 결정)

- **R1 브랜치 전략**: 현재 워킹트리는 `feature/mobile-profile-onboarding-393`(PR #394, 별개 관심사,
  dev 머지 대기) 위에 미커밋 1차 수정(모바일 폼 오버플로우/썸네일/버튼 중앙 7파일)이 얹혀 있음.
  디자인 리터치는 **별개 feature 브랜치를 origin/develop에서 분기**해야 한다
  (`[[feedback_branch_from_origin_develop]]`). → **플랜 단계 첫 결정**: 1차 수정의 귀속
  (#394에 합칠지 / 디자인 브랜치로 가져올지 / 별도 처리)과 새 브랜치 분기를 확정.
- **R2 A2 렌더 불변**: 데스크탑 `VideoTitle` 추출 시 클래스/DOM 한 글자라도 바뀌면 안 됨.
  추출은 "프레젠테이션만 분리 + 데스크탑은 위임" 형태로 제한.
- **R3 여백 비율 환산(D5)**: "같은 비율"의 구체 수치는 화면별 실측 스크린샷 보며 조정.
  플랜에서 모바일 표준 리듬 1벌을 먼저 정의하고 화면에 적용.
- **R4 i18n**: 라벨을 raw 텍스트→Typography로 옮길 때 기존 i18n 키 유지(드리프트 금지,
  `[[feedback_pfplay_web_i18n_drift]]`).

## 9. 영향 받는 주요 경로 (요약)

- 신규: `src/shared/ui/components/{track-title,mobile-sheet-header,mobile-tab-bar}/`
- 수정(데스크탑, 렌더 불변): `src/widgets/partyroom-display-board/ui/parts/video-title.component.tsx`
- 수정(모바일): 섹션 B 표의 파일들
