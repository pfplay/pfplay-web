# pfplay-web 테스트 로드맵

> 최종 갱신: 2026-03-02 | 브랜치: `test/add-mocking-tests`

---

## 1. 현재 상태 분석

### 1-1. 정량 지표

| 지표            | 초기값 | 현재    |
| --------------- | ------ | ------- |
| 테스트 스위트   | 104    | **151** |
| 테스트 케이스   | 655    | **863** |
| 소스 모듈 총 수 | 471    | 471     |

### 1-2. FSD 레이어별 소스 / 테스트 분포

| 레이어   | 소스 모듈 | 테스트 파일 | 테스트 비율 | 비율 변화 |
| -------- | --------- | ----------- | ----------- | --------- |
| shared   | 215       | 86          | 40.0 %      | +5.6      |
| entities | 90        | 35          | 38.9 %      | -4.5      |
| features | 168       | 20          | 11.9 %      | **+6.5**  |
| widgets  | 60        | 8           | 13.3 %      | **+9.2**  |
| app      | 37        | 0           | 0 %         | —         |

### 1-3. 레이어 × 테스트 기법 매트릭스

> 각 셀: `완료 / 전체` (해당 없음은 `—`, 통합-MSW는 테스트 파일 수)

| 레이어 \ 기법 | 유닛-함수 | 유닛-모델 | 유닛-클래스 |  유닛-훅  | 유닛-컴포넌트 | 통합-MSW |
| ------------- | :-------: | :-------: | :---------: | :-------: | :-----------: | :------: |
| **shared**    |  24/~50   |    0/2    |   17/~22    | **12/14** |   **21/31**   |    5     |
| **entities**  |     1     |   12/17   |      3      | **15/31** |     1/10      |  **2**   |
| **features**  |     —     |    4/4    |      —      | **10/74** |     0/68      |  **6**   |
| **widgets**   |     —     |    2/2    |      —      |    0/7    |   **5/13**    |  **1**   |
| **app**       |     —     |     —     |      —      |     —     |      0/7      |    —     |

### 1-4. 강점

- **순수 함수**: 24개 파일, 높은 품질의 경계값·엣지 케이스 커버
- **모델/스토어**: Zustand 스토어 + 도메인 모델 16/23 테스트 완료
- **클래스**: Singleton, 데코레이터, Chat, WebSocket 등 핵심 인프라 테스트
- **MSW 인프라**: jest-msw-env, 커스텀 resolver, handlers 등 통합 테스트 기반 구축 완료
- **구독 콜백**: partyroom-client 이벤트 핸들러 11개 전수 테스트
- **shared/ui**: 21개 공유 컴포넌트 테스트 완료 (폼, 레이아웃, 표시 컴포넌트)
- **권한 훅**: features 레이어 permission 훅 10개 전수 테스트
- **통합 테스트**: 14개 MSW 통합 테스트로 서비스→인터셉터→캐시 파이프라인 검증

### 1-5. 취약점

- **features 훅 (비즈니스 로직)**: `lib/` 디렉토리의 복합 훅(enter, exit, close 등) 미테스트
- **features 컴포넌트**: 68개 중 0개 테스트
- **API 훅 잔여**: mutation/query 중 24개 통합 테스트 없음
- **app 레이어**: 테스트 0개
- **E2E 테스트**: 없음

---

## 2. 목표 수립

### ~~Phase 1: 미테스트 모델/스토어 완성~~ `유닛-모델` — SKIP

7개 모두 타입/인터페이스 정의만 존재. 구현체(store, adapter)는 이미 테스트 완료.
실질 커버율 **100%**.

---

### Phase 2: shared/ui 핵심 컴포넌트 테스트 `유닛-컴포넌트` — ✅ 18/21 완료

**실적**: 18개 파일, ~110케이스

#### Tier 1 — 폼 컴포넌트 ✅

- [x] `shared/ui/components/button/button.component.tsx`
- [x] `shared/ui/components/select/select.component.tsx`
- [x] `shared/ui/components/textarea/textarea.component.tsx`
- [x] `shared/ui/components/radio-select-list/radio-select-list.component.tsx`
- [x] `shared/ui/components/form-item/form-item.component.tsx`

#### Tier 2 — 레이아웃/내비게이션 ✅

- [x] `shared/ui/components/dialog/dialog.component.tsx`
- [x] `shared/ui/components/drawer/drawer.component.tsx`
- [x] `shared/ui/components/tab/tab.component.tsx`
- [x] `shared/ui/components/collapse-list/collapse-list.component.tsx`
- [x] `shared/ui/components/tooltip/tooltip.component.tsx`

#### Tier 3 — 표시 컴포넌트 ✅

- [x] `shared/ui/components/tag/tag.component.tsx`
- [x] `shared/ui/components/profile/profile.component.tsx`
- [x] `shared/ui/components/loading/loading.component.tsx`
- [x] `shared/ui/components/typography/typography.component.tsx`
- [x] `shared/ui/components/back-button/back-button.component.tsx`

#### Tier 4 — 복합 컴포넌트 (3/6)

- [ ] `shared/ui/components/menu/menu-button.component.tsx`
- [ ] `shared/ui/components/menu/menu-item-panel.component.tsx`
- [ ] `shared/ui/components/icon-menu/icon-menu.component.tsx`
- [x] `shared/ui/components/infinite-scroll/infinite-scroll.component.tsx`
- [x] `shared/ui/components/user-list-item/user-list-item.component.tsx`
- [x] `shared/ui/components/dj-list-item/dj-list-item.component.tsx`

---

### Phase 3: shared 훅 테스트 확장 `유닛-훅` — ✅ 6/8 완료

**실적**: 6개 파일, 16케이스

- [x] `shared/lib/hooks/use-intersection-observer.hook.ts`
- [x] `shared/lib/hooks/use-portal-root.hook.ts`
- [x] `shared/lib/hooks/use-vertical-stretch.hook.ts`
- [x] `shared/lib/localization/use-change-language.hook.tsx`
- [ ] `shared/lib/localization/use-languages.hook.ts`
- [x] `shared/lib/router/use-app-router.hook.ts`
- [ ] `shared/ui/components/dialog/use-dialog.hook.tsx`
- [x] `shared/api/http/error/use-on-error.hook.ts`

---

### Phase 4: API 통합 테스트 확장 `통합-MSW` — 🔶 12/38 완료

**실적**: 7개 파일 (신규), ~44케이스

#### 4-1. 파티룸 도메인 (2/8)

- [x] `features/partyroom/enter/api/use-enter-partyroom.mutation.ts`
- [ ] `features/partyroom/exit/api/use-exit-partyroom.mutation.ts`
- [x] `features/partyroom/create/api/use-create-partyroom.mutation.ts`
- [ ] `features/partyroom/close/api/use-close-partyroom.mutation.ts`
- [ ] `features/partyroom/edit/api/use-edit-partyroom.mutation.ts`
- [ ] `features/partyroom/list/api/use-fetch-general-partyrooms.query.ts`
- [ ] `features/partyroom/list/api/use-fetch-main-partyroom.query.ts`
- [ ] `features/partyroom/get-summary/api/use-fetch-partyroom-detail-summary.query.tsx`

#### 4-2. DJ / 재생 도메인 (2/9)

- [ ] `features/partyroom/list-djing-queue/api/use-fetch-djing-queue.query.ts`
- [ ] `features/partyroom/lock-djing-queue/api/use-lock-djing-queue.mutation.ts`
- [ ] `features/partyroom/unlock-djing-queue/api/use-unlock-djing-queue.mutation.ts`
- [ ] `features/partyroom/delete-dj-from-queue/api/use-delete-dj-from-queue.mutation.ts`
- [ ] `features/partyroom/skip-playback/api/use-skip-playback.mutation.tsx`
- [ ] `features/partyroom/evaluate-current-playback/api/use-evaluate-current-playback.mutation.ts`
- [ ] `features/partyroom/list-playback-histories/api/use-fetch-playback-histories.query.ts`
- [x] `widgets/partyroom-djing-dialog/api/use-register-me-to-queue.mutation.ts`
- [x] `widgets/partyroom-djing-dialog/api/use-unregister-me-from-queue.mutation.ts`

#### 4-3. 크루 / 권한 도메인 (3/7)

- [x] `features/partyroom/adjust-grade/api/use-adjust-grade.mutation.ts`
- [x] `features/partyroom/block-crew/api/use-block-crew.mutation.tsx`
- [x] `features/partyroom/unblock-crew/api/use-unblock-crew.mutation.tsx`
- [ ] `features/partyroom/impose-penalty/api/use-impose-penalty.mutation.tsx`
- [ ] `features/partyroom/lift-penalty/api/use-lift-penalty.mutation.tsx`
- [ ] `features/partyroom/list-penalties/api/use-fetch-penalties.query.ts`
- [ ] `features/partyroom/list-my-blocked-crews/api/use-fetch-my-blocked-crews.query.ts`

#### 4-4. 플레이리스트 도메인 (5/6)

- [x] `features/playlist/add-tracks/api/use-add-playlist-track.mutation.ts`
- [x] `features/playlist/edit/api/use-update-playlist.mutation.ts`
- [ ] `features/playlist/list/api/use-fetch-playlists.query.ts`
- [x] `features/playlist/list-tracks/api/use-fetch-playlist-tracks.query.ts`
- [x] `features/playlist/remove/api/use-remove-playlist.mutation.ts`
- [x] `features/playlist/move-track-to-the-other-playlist/api/use-change-track-order.mutation.ts`

#### 4-5. 인증 / 프로필 도메인 (0/9)

- [ ] `features/sign-in/by-guest/api/use-sign-in.mutation.ts`
- [ ] `features/sign-out/api/use-sign-out.mutation.ts`
- [ ] `features/edit-profile-bio/api/use-update-my-bio.mutation.ts`
- [ ] `features/edit-profile-avatar/api/use-update-my-avatar.mutation.ts`
- [ ] `features/edit-profile-avatar/api/use-fetch-avatar-bodies.query.ts`
- [ ] `features/edit-profile-avatar/api/use-fetch-avatar-faces.query.ts`
- [ ] `entities/me/api/use-prefetch-me.query.ts`
- [ ] `entities/wallet/api/use-fetch-nfts.query.ts`
- [ ] `entities/wallet/api/use-update-my-wallet.mutation.ts`

---

### Phase 5: entities/features 레이어 훅 테스트 `유닛-훅` — 🔶 15/26 완료

**실적**: 14개 파일, 48케이스

#### 5-1. entities 훅 (4/13)

- [ ] `entities/current-partyroom/lib/use-chat.hook.ts`
- [x] `entities/current-partyroom/lib/use-remove-current-partyroom-caches.hook.ts`
- [ ] `entities/current-partyroom/lib/alerts/use-alert.hook.tsx`
- [ ] `entities/current-partyroom/lib/alerts/use-alerts.hook.tsx`
- [ ] `entities/current-partyroom/lib/alerts/use-grade-adjusted-alert.hook.tsx`
- [ ] `entities/current-partyroom/lib/alerts/use-penalty-alert.hook.tsx`
- [ ] `entities/me/api/use-fetch-me-async.ts`
- [ ] `entities/me/api/use-get-my-service-entry.ts`
- [x] `entities/me/lib/use-is-guest.hook.tsx`
- [ ] `entities/wallet/lib/use-global-wallet-sync.hook.ts`
- [x] `entities/wallet/lib/use-is-nft.hook.ts`
- [x] `entities/wallet/lib/use-is-wallet-linked.hook.ts`
- [ ] `entities/wallet/lib/use-nfts.hook.ts`

#### 5-2. features 권한 훅 ✅ (10/10) — 보너스 달성

- [x] `features/partyroom/adjust-grade/api/use-can-adjust-grade.hook.ts`
- [x] `features/partyroom/close/api/use-can-close-current-partyroom.hook.ts`
- [x] `features/partyroom/edit/api/use-can-edit-current-partyroom.hook.ts`
- [x] `features/partyroom/impose-penalty/api/use-can-impose-penalty.hook.ts`
- [x] `features/partyroom/impose-penalty/api/use-can-remove-chat-message.hook.ts` (동일 파일)
- [x] `features/partyroom/lift-penalty/api/use-can-lift-penalty.hook.ts`
- [x] `features/partyroom/list-penalties/api/use-can-view-penalties.hook.ts`
- [x] `features/partyroom/lock-djing-queue/lib/use-can-lock-djing-queue.hook.ts`
- [x] `features/partyroom/unlock-djing-queue/lib/use-can-unlock-djing-queue.hook.ts`
- [x] `features/partyroom/delete-dj-from-queue/lib/use-can-delete-dj-from-queue.hook.ts`

#### 5-3. features 비즈니스 훅 (1/13)

- [ ] `features/partyroom/enter/lib/use-enter-partyroom.ts`
- [ ] `features/partyroom/enter/lib/use-partyroom-enter-error-alerts.ts`
- [ ] `features/partyroom/exit/lib/use-exit-partyroom.ts`
- [ ] `features/partyroom/close/lib/use-close-partyroom.hook.tsx`
- [x] `features/partyroom/list-crews/lib/use-crews.hook.ts`
- [ ] `features/partyroom/adjust-grade/lib/use-adjust-grade.hook.tsx`
- [ ] `features/partyroom/impose-penalty/lib/use-impose-penalty.hook.tsx`
- [ ] `features/partyroom/block-crew/lib/use-block-crew.hook.tsx`
- [ ] `features/sign-in/by-guest/lib/use-sign-in.hook.tsx`
- [ ] `features/sign-in/by-guest/lib/use-auto-sign-in.hook.ts`
- [ ] `features/sign-in/by-social/lib/use-initiate-sign-in.tsx`
- [ ] `features/sign-in/by-social/lib/use-social-sign-in-callback.hook.tsx`
- [ ] `features/sign-out/lib/use-sign-out.hook.ts`

---

### Phase 6: widgets 레이어 테스트 `유닛-컴포넌트` `유닛-훅` — 🔶 5/15 완료

**실적**: 5개 파일, 21케이스

#### 6-1. 위젯 서브 컴포넌트 ✅ (5/5)

- [x] `widgets/partyroom-display-board/ui/parts/action-button.component.tsx`
- [x] `widgets/partyroom-display-board/ui/parts/video-title.component.tsx`
- [x] `widgets/partyroom-display-board/ui/parts/notice.component.tsx`
- [x] `widgets/partyroom-chat-panel/ui/authority-headset.component.tsx`
- [x] `widgets/music-preview-player/ui/dim-overlay.component.tsx`

#### 6-2. 위젯 메인 컴포넌트 (0/8)

- [ ] `widgets/partyroom-chat-panel/ui/partyroom-chat-panel.component.tsx`
- [ ] `widgets/partyroom-crews-panel/ui/partyroom-crews-panel.component.tsx`
- [ ] `widgets/partyroom-display-board/ui/display-board.component.tsx`
- [ ] `widgets/partyroom-djing-dialog/ui/dialog.component.tsx`
- [ ] `widgets/partyroom-detail/ui/main-panel.component.tsx`
- [ ] `widgets/my-playlist/ui/my-playlist.component.tsx`
- [ ] `widgets/layouts/ui/header.component.tsx`
- [ ] `widgets/sidebar/ui/sidebar.component.tsx`

#### 6-3. 위젯 훅 (0/2)

- [ ] `widgets/partyroom-avatars/lib/use-assign-avatar-positions.hook.ts`
- [ ] `widgets/partyroom-avatars/lib/use-avatar-cluster.hook.ts`

---

## 3. 우선순위 매트릭스

| Phase                       | 기법             | 상태     | 완료 항목         | 잔여     | +케이스 |
| --------------------------- | ---------------- | -------- | ----------------- | -------- | ------- |
| ~~1. 모델/스토어~~          | 유닛-모델        | SKIP     | —                 | —        | —       |
| **2. shared/ui**            | 유닛-컴포넌트    | ✅ 18/21 | 18파일 ~110케이스 | 3 (menu) | +110    |
| **3. shared 훅**            | 유닛-훅          | ✅ 6/8   | 6파일 16케이스    | 2        | +16     |
| **4. API 통합**             | 통합-MSW         | 🔶 12/38 | 7파일 ~44케이스   | 26       | +44     |
| **5. entities/features 훅** | 유닛-훅          | 🔶 15/26 | 14파일 48케이스   | 21       | +48     |
| **6. widgets**              | 유닛-컴포넌트/훅 | 🔶 5/15  | 5파일 21케이스    | 10       | +21     |

**총 신규**: +47파일, +208케이스 (655 → 863)

### 잔여 작업 예상

| 잔여 항목                       | 난이도 | 예상 케이스 |
| ------------------------------- | ------ | ----------- |
| Phase 2 잔여 (menu 3개)         | 중간   | ~15         |
| Phase 3 잔여 (2개)              | 낮음   | ~6          |
| Phase 4 잔여 (26개 API 훅)      | 중간   | ~80         |
| Phase 5 잔여 (21개 비즈니스 훅) | 높음   | ~60         |
| Phase 6 잔여 (10개 위젯)        | 높음   | ~40         |
| **합계**                        |        | **~200**    |

### 최종 목표 지표

| 지표                | 초기 | 현재      | 전체 완료 시 |
| ------------------- | ---- | --------- | ------------ |
| 테스트 케이스       | 655  | **863**   | ~1060        |
| shared/ui 커버율    | 3/31 | **21/31** | 24/31        |
| shared 훅 커버율    | 6/14 | **12/14** | 14/14        |
| API 훅 통합         | 4/38 | **12/38** | 38/38        |
| features 훅 커버율  | 0/74 | **10/74** | ~33/74       |
| widgets 테스트 비율 | 4.1% | **13.3%** | ~25%         |

---

## 4. 인프라 체크리스트

### 완료

- [x] MSW v2 설치 및 구성
- [x] 커스텀 Jest 환경 (`jest-msw-env.ts`) — jsdom + Node.js fetch 글로벌
- [x] 커스텀 Jest resolver (`jest.resolver.js`) — MSW exports 해결
- [x] `transformIgnorePatterns` — ESM → CJS 변환
- [x] MSW 핸들러 (`handlers.ts`) — 플레이리스트, 유저, 파티룸, 크루, DJ, 인증
- [x] 테스트 유틸 (`test-utils.tsx`) — QueryClient, renderWithClient
- [x] MSW 서버 라이프사이클 (`msw-server.ts`)
- [x] ResizeObserver 글로벌 mock (Headless UI 호환)

### 미완료

- [ ] MSW 핸들러 확장 — 아바타, 지갑, 페널티, 재생이력 엔드포인트
- [ ] `@testing-library/jest-dom` 도입 (현재 `toBeTruthy()` 대체 사용)
- [ ] Storybook 도입 (컴포넌트 시각적 테스트)
- [ ] E2E 테스트 프레임워크 선정 (Playwright / Cypress)
- [ ] CI 파이프라인 테스트 자동화
- [ ] 커버리지 리포트 CI 연동 (codecov / coveralls)
- [ ] 커버리지 임계값 설정 (jest `coverageThreshold`)

---

## 5. 실행 원칙

1. **Phase 순서 준수**: 낮은 난이도 + 높은 ROI 항목부터 진행
2. **도메인 단위 작업**: 한 도메인(파티룸, 플레이리스트 등)의 테스트를 한번에 완성
3. **MSW 핸들러 확장 → 통합 테스트** 순서: handlers.ts를 먼저 확장 후 테스트 작성
4. **기존 패턴 유지**: 현재 테스트 파일의 네이밍, 구조, assertion 패턴 준수
5. **Phase별 커밋**: 각 Phase 또는 서브Phase 완료 시 커밋

---

## 6. 알려진 제약사항

- **jest-dom 미설정**: `toBeInTheDocument()` 사용 불가 → `toBeTruthy()` / `toBeFalsy()` 대체
- **ErrorCode 검증**: `getErrorCode()`가 enum에 없는 코드를 무시 → 테스트 시 `ErrorCode` enum 값만 사용
- **MSW 서버 임포트**: `msw-server.ts`를 명시적 import 필요 (`server.use()` 없는 파일도)
- **useIsNft 반환값**: `nfts && nfts.find(...)` → undefined 데이터 시 `undefined` 반환 (not `false`)
