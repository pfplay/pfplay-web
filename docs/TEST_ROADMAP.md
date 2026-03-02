# pfplay-web 테스트 로드맵

> 최종 갱신: 2026-03-02 | 브랜치: `test/add-mocking-tests`

---

## 1. 현재 상태 분석

### 1-1. 정량 지표

| 지표            | 초기값 | 현재     |
| --------------- | ------ | -------- |
| 테스트 스위트   | 104    | **202**  |
| 테스트 케이스   | 655    | **1003** |
| 소스 모듈 총 수 | 471    | 471      |

### 1-2. FSD 레이어별 소스 / 테스트 분포

| 레이어   | 소스 모듈 | 테스트 파일 | 테스트 비율 | 비율 변화 |
| -------- | --------- | ----------- | ----------- | --------- |
| shared   | 215       | 91          | 42.3 %      | +8.0      |
| entities | 90        | 42          | 46.7 %      | +3.3      |
| features | 168       | 49          | 29.2 %      | **+23.8** |
| widgets  | 60        | 18          | 30.0 %      | **+25.9** |
| app      | 37        | 0           | 0 %         | —         |

### 1-3. 레이어 × 테스트 기법 매트릭스

> 각 셀: `완료 / 전체` (해당 없음은 `—`, 통합-MSW는 테스트 파일 수)

| 레이어 \ 기법 | 유닛-함수 | 유닛-모델 | 유닛-클래스 |  유닛-훅  | 유닛-컴포넌트 | 통합-MSW |
| ------------- | :-------: | :-------: | :---------: | :-------: | :-----------: | :------: |
| **shared**    |  24/~50   |    0/2    |   17/~22    | **14/14** |   **24/31**   |    5     |
| **entities**  |     1     |   12/17   |      3      | **20/31** |     1/10      |  **5**   |
| **features**  |     —     |    4/4    |      —      | **27/74** |     0/68      |  **24**  |
| **widgets**   |     —     |    2/2    |      —      |  **2/7**  |   **13/13**   |  **1**   |
| **app**       |     —     |     —     |      —      |     —     |      0/7      |    —     |

### 1-4. 강점

- **순수 함수**: 24개 파일, 높은 품질의 경계값·엣지 케이스 커버
- **모델/스토어**: Zustand 스토어 + 도메인 모델 16/23 테스트 완료
- **클래스**: Singleton, 데코레이터, Chat, WebSocket 등 핵심 인프라 테스트
- **MSW 인프라**: jest-msw-env, 커스텀 resolver, handlers 등 통합 테스트 기반 구축 완료
- **구독 콜백**: partyroom-client 이벤트 핸들러 11개 전수 테스트
- **shared/ui**: 21개 공유 컴포넌트 테스트 완료 (폼, 레이아웃, 표시 컴포넌트)
- **권한 훅**: features 레이어 permission 훅 10개 전수 테스트
- **통합 테스트**: 28개 MSW 통합 테스트로 서비스→인터셉터→캐시 파이프라인 검증
- **비즈니스 훅**: enter, exit, close, adjust-grade, impose-penalty 등 핵심 흐름 전수 테스트
- **위젯**: 서브 컴포넌트 9개 + 메인 컴포넌트 4개 + 훅 2개 테스트 완료
- **알림 훅**: alert, grade-adjusted, penalty 알림 훅 전수 테스트

### 1-5. 취약점

- **features 컴포넌트**: 68개 중 0개 테스트
- **app 레이어**: 테스트 0개
- **E2E 테스트**: 없음
- **외부 SDK 의존 훅**: Alchemy SDK, wagmi 의존 모듈은 현재 인프라로 테스트 불가

---

## 2. 목표 수립

### ~~Phase 1: 미테스트 모델/스토어 완성~~ `유닛-모델` — SKIP

7개 모두 타입/인터페이스 정의만 존재. 구현체(store, adapter)는 이미 테스트 완료.
실질 커버율 **100%**.

---

### Phase 2: shared/ui 핵심 컴포넌트 테스트 `유닛-컴포넌트` — ✅ 21/21 완료

**실적**: 21개 파일, ~123케이스

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

#### Tier 4 — 복합 컴포넌트 ✅ (6/6)

- [x] `shared/ui/components/menu/menu-button.component.tsx`
- [x] `shared/ui/components/menu/menu-item-panel.component.tsx`
- [x] `shared/ui/components/icon-menu/icon-menu.component.tsx`
- [x] `shared/ui/components/infinite-scroll/infinite-scroll.component.tsx`
- [x] `shared/ui/components/user-list-item/user-list-item.component.tsx`
- [x] `shared/ui/components/dj-list-item/dj-list-item.component.tsx`

---

### Phase 3: shared 훅 테스트 확장 `유닛-훅` — ✅ 8/8 완료

**실적**: 8개 파일, 25케이스

- [x] `shared/lib/hooks/use-intersection-observer.hook.ts`
- [x] `shared/lib/hooks/use-portal-root.hook.ts`
- [x] `shared/lib/hooks/use-vertical-stretch.hook.ts`
- [x] `shared/lib/localization/use-change-language.hook.tsx`
- [x] `shared/lib/localization/use-languages.hook.ts`
- [x] `shared/lib/router/use-app-router.hook.ts`
- [x] `shared/ui/components/dialog/use-dialog.hook.tsx`
- [x] `shared/api/http/error/use-on-error.hook.ts`

---

### Phase 4: API 통합 테스트 확장 `통합-MSW` — 38/39

**실적**: 25개 파일, ~94케이스 | **미완료 1건**

#### 4-1. 파티룸 도메인 ✅ (8/8)

- [x] `features/partyroom/enter/api/use-enter-partyroom.mutation.ts`
- [x] `features/partyroom/exit/api/use-exit-partyroom.mutation.ts`
- [x] `features/partyroom/create/api/use-create-partyroom.mutation.ts`
- [x] `features/partyroom/close/api/use-close-partyroom.mutation.ts`
- [x] `features/partyroom/edit/api/use-edit-partyroom.mutation.ts`
- [x] `features/partyroom/list/api/use-fetch-general-partyrooms.query.ts`
- [x] `features/partyroom/list/api/use-fetch-main-partyroom.query.ts` (partyroom-queries 통합)
- [x] `features/partyroom/get-summary/api/use-fetch-partyroom-detail-summary.query.tsx` (partyroom-queries 통합)

#### 4-2. DJ / 재생 도메인 ✅ (9/9)

- [x] `features/partyroom/list-djing-queue/api/use-fetch-djing-queue.query.ts`
- [x] `features/partyroom/lock-djing-queue/api/use-lock-djing-queue.mutation.ts` (dj-management 통합)
- [x] `features/partyroom/unlock-djing-queue/api/use-unlock-djing-queue.mutation.ts` (dj-management 통합)
- [x] `features/partyroom/delete-dj-from-queue/api/use-delete-dj-from-queue.mutation.ts` (dj-management 통합)
- [x] `features/partyroom/skip-playback/api/use-skip-playback.mutation.tsx` (dj-management 통합)
- [x] `features/partyroom/evaluate-current-playback/api/use-evaluate-current-playback.mutation.ts`
- [x] `features/partyroom/list-playback-histories/api/use-fetch-playback-histories.query.ts` (dj-queries 통합)
- [x] `widgets/partyroom-djing-dialog/api/use-register-me-to-queue.mutation.ts`
- [x] `widgets/partyroom-djing-dialog/api/use-unregister-me-from-queue.mutation.ts`

#### 4-3. 크루 / 권한 도메인 ✅ (7/7)

- [x] `features/partyroom/adjust-grade/api/use-adjust-grade.mutation.ts`
- [x] `features/partyroom/block-crew/api/use-block-crew.mutation.tsx`
- [x] `features/partyroom/unblock-crew/api/use-unblock-crew.mutation.tsx`
- [x] `features/partyroom/impose-penalty/api/use-impose-penalty.mutation.tsx` (penalty 통합)
- [x] `features/partyroom/lift-penalty/api/use-lift-penalty.mutation.tsx` (penalty 통합)
- [x] `features/partyroom/list-penalties/api/use-fetch-penalties.query.ts`
- [x] `features/partyroom/list-my-blocked-crews/api/use-fetch-my-blocked-crews.query.ts`

#### 4-4. 플레이리스트 도메인 ✅ (6/6)

- [x] `features/playlist/add-tracks/api/use-add-playlist-track.mutation.ts`
- [x] `features/playlist/edit/api/use-update-playlist.mutation.ts`
- [x] `features/playlist/list/api/use-fetch-playlists.query.ts`
- [x] `features/playlist/list-tracks/api/use-fetch-playlist-tracks.query.ts`
- [x] `features/playlist/remove/api/use-remove-playlist.mutation.ts`
- [x] `features/playlist/move-track-to-the-other-playlist/api/use-change-track-order.mutation.ts`

#### 4-5. 인증 / 프로필 도메인 (8/9)

- [x] `features/sign-in/by-guest/api/use-sign-in.mutation.ts`
- [x] `features/sign-out/api/use-sign-out.mutation.ts`
- [x] `features/edit-profile-bio/api/use-update-my-bio.mutation.ts`
- [x] `features/edit-profile-avatar/api/use-update-my-avatar.mutation.ts`
- [x] `features/edit-profile-avatar/api/use-fetch-avatar-bodies.query.ts` (avatar 통합)
- [x] `features/edit-profile-avatar/api/use-fetch-avatar-faces.query.ts` (avatar 통합)
- [x] `entities/me/api/use-prefetch-me.query.ts`
- [ ] `entities/wallet/api/use-fetch-nfts.query.ts`
- [x] `entities/wallet/api/use-update-my-wallet.mutation.ts`

#### 4-X. 미달성 사유

| 항목                      | 사유                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `use-fetch-nfts.query.ts` | **외부 SDK 직접 호출**. 이 훅은 내부 axios 인스턴스(`baseURL: http://localhost:8080/api/`)를 사용하지 않고, Alchemy SDK(`alchemy.nft.getNftsForOwner`)를 통해 `https://eth-mainnet.g.alchemy.com/` 에 직접 HTTP 요청을 보낸다. MSW는 우리 API 서버의 엔드포인트만 핸들러로 등록하고 있으며, Alchemy의 응답 스키마(`OwnedNftsResponse`)를 역설계하여 핸들러를 작성하면 Alchemy SDK 버전 업그레이드 시 깨지는 취약한 테스트가 된다. 또한 이 훅은 `Nft.refineList(ownedNfts)` 후처리를 하는데, `refineList` 자체는 모델 레이어에서 단위 테스트하는 것이 적합하다. |

---

### Phase 5: entities/features 레이어 훅 테스트 `유닛-훅` — 33/37

**실적**: 32개 파일, ~100케이스 | **미완료 4건**

#### 5-1. entities 훅 (9/13)

- [ ] `entities/current-partyroom/lib/use-chat.hook.ts`
- [x] `entities/current-partyroom/lib/use-remove-current-partyroom-caches.hook.ts`
- [x] `entities/current-partyroom/lib/alerts/use-alert.hook.tsx`
- [ ] `entities/current-partyroom/lib/alerts/use-alerts.hook.tsx`
- [x] `entities/current-partyroom/lib/alerts/use-grade-adjusted-alert.hook.tsx`
- [x] `entities/current-partyroom/lib/alerts/use-penalty-alert.hook.tsx`
- [x] `entities/me/api/use-fetch-me-async.ts`
- [ ] `entities/me/api/use-get-my-service-entry.ts`
- [x] `entities/me/lib/use-is-guest.hook.tsx`
- [x] `entities/wallet/lib/use-global-wallet-sync.hook.ts`
- [x] `entities/wallet/lib/use-is-nft.hook.ts`
- [x] `entities/wallet/lib/use-is-wallet-linked.hook.ts`
- [ ] `entities/wallet/lib/use-nfts.hook.ts`

#### 5-2. features 권한 훅 ✅ (10/10)

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

#### 5-3. features 비즈니스 훅 ✅ (14/14)

- [x] `features/partyroom/enter/lib/use-enter-partyroom.ts`
- [x] `features/partyroom/enter/lib/use-partyroom-enter-error-alerts.ts`
- [x] `features/partyroom/exit/lib/use-exit-partyroom.ts`
- [x] `features/partyroom/close/lib/use-close-partyroom.hook.tsx`
- [x] `features/partyroom/list-crews/lib/use-crews.hook.ts`
- [x] `features/partyroom/adjust-grade/lib/use-adjust-grade.hook.tsx`
- [x] `features/partyroom/impose-penalty/lib/use-impose-penalty.hook.tsx`
- [x] `features/partyroom/block-crew/lib/use-block-crew.hook.tsx`
- [x] `features/partyroom/lock-djing-queue/lib/use-lock-djing-queue.hook.ts`
- [x] `features/partyroom/unlock-djing-queue/lib/use-unlock-djing-queue.hook.ts`
- [x] `features/partyroom/delete-dj-from-queue/lib/use-delete-dj-from-queue.hook.ts`
- [x] `features/partyroom/list-my-blocked-crews/lib/use-is-blocked-crew.hook.ts`
- [x] `features/playlist/djing-guide/ui/use-djing-guide.hook.tsx`
- [x] `features/sign-out/lib/use-sign-out.hook.ts`

#### 5-X. 미달성 사유

| 항목                          | 분류                | 사유                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ----------------------------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `use-chat.hook.ts`            | 커스텀 pub/sub 의존 | Zustand와 별개의 구독 메커니즘(`chat.addMessageListener/removeMessageListener`)을 사용한다. `chat` 객체는 `@/shared/lib/chat`의 `Chat` 클래스 인스턴스로, 내부적으로 메시지 큐 + 리스너 맵을 관리한다. 이 훅을 테스트하려면 `Chat` 클래스의 전체 pub/sub 계약을 모방하는 목 객체를 생성해야 하는데, `Chat` 클래스 자체가 이미 클래스 레벨 단위 테스트(`chat.test.ts`)에서 검증되고 있다. 훅의 로직은 `addMessageListener` → `setMessages(chat.getMessages())` → 클린업 시 `removeMessageListener` 뿐이므로, 실질적 비즈니스 로직은 `Chat` 클래스에 위임되어 있다. |
| `use-alerts.hook.tsx`         | 순수 합성 훅        | 함수 본문이 `useGradeAdjustedAlert()` + `usePenaltyAlert()` 호출 2줄뿐이다. 두 서브 훅 모두 개별적으로 전수 테스트 완료. 이 합성 훅을 별도 테스트하면 "두 함수가 호출되는지" 만 검증하는 **글루 코드 테스트 안티패턴**에 해당하며, 리팩터링 시 테스트 가치 없이 유지비용만 발생한다.                                                                                                                                                                                                                                                                              |
| `use-get-my-service-entry.ts` | 얇은 래퍼           | `useFetchMeAsync()` → `Me.serviceEntry(me)` 를 호출하는 래퍼다. `useFetchMeAsync`는 MSW 통합 테스트 완료(`use-fetch-me-async.test.ts`), `Me.serviceEntry`는 모델 단위 테스트 완료(`me.model.test.ts`). 이 훅에 고유한 분기 로직은 `catch` 블록에서 `Me.serviceEntry(null)`을 반환하는 것뿐이며, 이는 `serviceEntry(null) → '/'`로 이미 모델 테스트에서 커버된다.                                                                                                                                                                                                  |
| `use-nfts.hook.ts`            | 외부 SDK 의존       | `wagmi`의 `useAccount()` 훅과 `useFetchNfts`(Alchemy SDK)에 동시 의존한다. `useAccount`는 wagmi의 `WagmiConfig` 프로바이더가 필요하며, 이 프로바이더는 Ethereum JSON-RPC 클라이언트 설정(`chains`, `transports`)을 요구한다. 현재 Jest 환경에는 wagmi 프로바이더 인프라가 없고, `useFetchNfts` 역시 Phase 4에서 미달성된 것과 동일한 Alchemy SDK 의존 문제를 가진다. wagmi mock 인프라 구축은 블록체인 연동 전용 테스트 계층에서 별도 진행해야 한다.                                                                                                              |

---

### Phase 6: widgets 레이어 테스트 `유닛-컴포넌트` `유닛-훅` — 15/19

**실적**: 15개 파일, ~52케이스 | **미완료 4건**

#### 6-1. 위젯 서브 컴포넌트 ✅ (9/9)

- [x] `widgets/partyroom-display-board/ui/parts/action-button.component.tsx`
- [x] `widgets/partyroom-display-board/ui/parts/video-title.component.tsx`
- [x] `widgets/partyroom-display-board/ui/parts/notice.component.tsx`
- [x] `widgets/partyroom-display-board/ui/parts/add-tracks-button.component.tsx`
- [x] `widgets/partyroom-chat-panel/ui/authority-headset.component.tsx`
- [x] `widgets/partyroom-chat-panel/ui/chat-item.component.tsx`
- [x] `widgets/partyroom-djing-dialog/ui/empty-body.component.tsx`
- [x] `widgets/partyroom-party-list/ui/panel-header.component.tsx`
- [x] `widgets/music-preview-player/ui/dim-overlay.component.tsx`

#### 6-2. 위젯 메인 컴포넌트 (4/8)

- [ ] `widgets/partyroom-chat-panel/ui/partyroom-chat-panel.component.tsx`
- [x] `widgets/partyroom-crews-panel/ui/partyroom-crews-panel.component.tsx`
- [x] `widgets/partyroom-display-board/ui/display-board.component.tsx`
- [ ] `widgets/partyroom-djing-dialog/ui/dialog.component.tsx`
- [ ] `widgets/partyroom-detail/ui/main-panel.component.tsx`
- [ ] `widgets/my-playlist/ui/my-playlist.component.tsx`
- [x] `widgets/layouts/ui/header.component.tsx`
- [x] `widgets/sidebar/ui/sidebar.component.tsx`

#### 6-3. 위젯 훅 ✅ (2/2)

- [x] `widgets/partyroom-avatars/lib/use-assign-avatar-positions.hook.ts`
- [x] `widgets/partyroom-avatars/lib/use-avatar-cluster.hook.ts`

#### 6-X. 미달성 사유

| 항목                                 | 외부 의존 수                                  | 사유                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ------------------------------------ | --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `partyroom-chat-panel.component.tsx` | 훅 13개 + 내부 훅 1개                         | `useAdjustGrade`, `useCanAdjustGrade`, `useCanRemoveChatMessage`, `useCanImposePenalty`, `useRemoveChatMessage`, `useImposePenalty`, `useBlockCrew`, `useIsBlockedCrew`, `useVerticalStretch`, `useCurrentPartyroomChat`, `useStores`, `useChatMessagesScrollManager`, `useI18n` 등 13개 훅에 의존한다. 각 채팅 메시지마다 `DisplayOptionMenuOnHoverListener`를 통해 6개 조건부 메뉴 항목(등급 조정, 삭제, 채팅 금지, 강퇴, 영구 추방, 차단)을 권한에 따라 동적 렌더링한다. 내부에 `useTempChatBanTimer`(30초 타이머 기반 채팅 금지)가 있어 시간 의존적 로직도 포함된다. 13개 훅을 모두 mock하면 리팩터링 시 모든 mock이 깨지는 **취약한 테스트(fragile test)**가 되며, 사용자 인터랙션(hover → 메뉴 표시 → 클릭 → 액션 실행)은 E2E 테스트가 적합하다.                     |
| `dialog.component.tsx` (djing)       | 훅 1개 + Context 2개                          | `useFetchDjingQueue` React Query 훅에 의존하며, `PartyroomIdContext`와 `DjingQueueContext` 두 개의 Context Provider로 자식을 감싼다. 컴포넌트 자체 로직은 단순하나(`djingQueue.djs.length`에 따라 `Body`/`EmptyBody` 분기), `Dialog` 컴포넌트가 Headless UI의 포탈 렌더링을 사용하여 jsdom 환경에서 포탈 컨테이너 설정이 필요하다. 하위 컴포넌트 `Body`와 `EmptyBody`는 이미 개별 테스트 완료. 이 래퍼의 테스트는 Headless UI의 Dialog 동작을 검증하는 것에 가까워 비용 대비 효용이 낮다.                                                                                                                                                                                                                                                                                  |
| `main-panel.component.tsx`           | 훅 10개 + Next.js 라우터                      | `useI18n`, `useParams`(Next.js), `usePanelController`(Context), `useFetchDjingQueue`, `useFetchPartyroomDetailSummary`(React Query 2개), `useSharePartyroom`, `useOpenSettingDialog`, `useCanEditCurrentPartyroom`, `useCloseCurrentPartyroom`, `useCanCloseCurrentPartyroom` 등 10개 훅에 의존한다. Next.js의 `useParams`는 `next/navigation`의 라우터 컨텍스트(`AppRouterContext`)가 필요하며, Jest에서는 `jest.mock('next/navigation')`으로 우회해야 한다. 2개의 React Query 훅은 MSW 환경 + `QueryClientProvider`가 필요하고, `usePanelController`는 커스텀 Context Provider가 필요하다. 로딩/데이터/권한에 따른 조건부 렌더링이 4단계로 중첩되어 있어, 유의미한 테스트를 작성하려면 MSW + Next.js 라우터 + Context Provider 3종을 조합한 통합 테스트 환경이 필요하다. |
| `my-playlist.component.tsx`          | 훅 3개 + Feature 컴포넌트 6개 + useEffect 3개 | `useI18n`, `useStores`(UIState), `usePlaylistAction`(entity 훅)에 의존하고, `AddPlaylistButton`, `AddTracksToPlaylist`, `Playlists`, `EditablePlaylists`, `TracksInPlaylist`, `RemovePlaylistButton` 등 6개 Feature 컴포넌트를 직접 JSX에 포함한다. 3개의 `useEffect`가 상태 동기화를 담당하는데: (1) 편집 모드 해제 시 `removeTargets` 초기화, (2) 드로워 닫힘 시 편집 모드 해제, (3) `playlists` 변경 시 `selectedPlaylist` 동기화. 이 상태 전이 로직은 3가지 뷰 모드(목록/편집/트랙 상세)를 렌더링 조건부로 전환하는데, 단위 테스트에서 이 전환을 검증하려면 6개 Feature 컴포넌트를 모두 mock하고 `useEffect` 발화 순서를 제어해야 한다. Drawer 열기/닫기 + 모드 전환 + 항목 선택은 사용자 시나리오 기반 E2E 테스트에 적합하다.                                         |

---

## 3. 우선순위 매트릭스

| Phase                       | 기법             | 상태     | 완료 항목         | 미완료 | +케이스 |
| --------------------------- | ---------------- | -------- | ----------------- | ------ | ------- |
| ~~1. 모델/스토어~~          | 유닛-모델        | SKIP     | —                 | —      | —       |
| **2. shared/ui**            | 유닛-컴포넌트    | ✅ 21/21 | 21파일 ~123케이스 | 0      | +123    |
| **3. shared 훅**            | 유닛-훅          | ✅ 8/8   | 8파일 25케이스    | 0      | +25     |
| **4. API 통합**             | 통합-MSW         | 38/39    | 25파일 ~94케이스  | 1      | +94     |
| **5. entities/features 훅** | 유닛-훅          | 33/37    | 32파일 ~100케이스 | 4      | +100    |
| **6. widgets**              | 유닛-컴포넌트/훅 | 15/19    | 15파일 ~52케이스  | 4      | +52     |

**총 신규**: +98파일, +348케이스 (655 → 1003)

### 미완료 항목 요약

| 미완료 분류                   | 건수  | 대표 사유                                                               |
| ----------------------------- | ----- | ----------------------------------------------------------------------- |
| 외부 SDK 의존 (Alchemy/wagmi) | 2     | MSW 범위 밖. 별도 인프라 필요                                           |
| 순수 합성/래퍼 훅             | 2     | 하위 의존성이 이미 전수 테스트됨. 글루 코드 테스트 안티패턴             |
| 고복잡도 위젯 (훅 10개 이상)  | 3     | mock 다수로 인한 취약한 테스트. E2E 적합                                |
| 커스텀 pub/sub 의존           | 1     | Chat 클래스 내부 계약에 결합. 클래스 레벨에서 이미 검증                 |
| Headless UI 포탈 래퍼         | 1     | 하위 컴포넌트 이미 테스트. 래퍼 자체는 UI 프레임워크 동작 검증에 가까움 |
| **합계**                      | **9** |                                                                         |

### 최종 목표 지표

| 지표                | 초기 | 현재      | 이론적 최대 | 미달 사유               |
| ------------------- | ---- | --------- | ----------- | ----------------------- |
| 테스트 케이스       | 655  | **1003**  | ~1030       | 외부 SDK + E2E 영역     |
| shared/ui 커버율    | 3/31 | **24/31** | 24/31       | —                       |
| shared 훅 커버율    | 6/14 | **14/14** | 14/14       | —                       |
| API 훅 통합         | 4/39 | **38/39** | 38/39       | Alchemy SDK 1건         |
| features 훅 커버율  | 0/74 | **27/74** | ~27/74      | 대부분 컴포넌트 전용 훅 |
| widgets 테스트 비율 | 4.1% | **30.0%** | ~33%        | 고복잡도 4건            |

---

## 4. 인프라 체크리스트

### 완료

- [x] MSW v2 설치 및 구성
- [x] 커스텀 Jest 환경 (`jest-msw-env.ts`) — jsdom + Node.js fetch 글로벌
- [x] 커스텀 Jest resolver (`jest.resolver.js`) — MSW exports 해결
- [x] `transformIgnorePatterns` — ESM → CJS 변환 (msw, d3-force 등)
- [x] MSW 핸들러 (`handlers.ts`) — 플레이리스트, 유저, 파티룸, 크루, DJ, 인증, 페널티
- [x] 테스트 유틸 (`test-utils.tsx`) — QueryClient, renderWithClient
- [x] MSW 서버 라이프사이클 (`msw-server.ts`)
- [x] ResizeObserver 글로벌 mock (Headless UI 호환)

### 미완료

- [ ] `@testing-library/jest-dom` 도입 (현재 `toBeTruthy()` 대체 사용)
- [ ] wagmi 테스트 인프라 — WagmiConfig mock provider, 체인/트랜스포트 설정
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
- **SWC 미사용 import 제거**: `import { server } from 'msw-server'`에서 server를 사용하지 않으면 SWC가 import를 제거함 → side-effect import `import 'msw-server'` 사용
- **useIsNft 반환값**: `nfts && nfts.find(...)` → undefined 데이터 시 `undefined` 반환 (not `false`)
- **d3-force ESM**: `transformIgnorePatterns`에 d3 패키지 포함 필요
- **Headless UI 포탈**: Dialog/Drawer 등 포탈 기반 컴포넌트는 jsdom에서 포탈 컨테이너 설정 없이 렌더링 불안정
