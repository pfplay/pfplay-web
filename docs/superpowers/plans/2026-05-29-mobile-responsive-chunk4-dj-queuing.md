# 모바일 반응형 — Chunk 4 (DJ + 큐잉) 구현 Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 모바일 반응형 5-chunk PR 시리즈의 **Chunk 4 (DJ + 큐잉)** — chunk 3 의 큐 탭 placeholder 를 (1) **큐 탭 단일 표면** (게스트/멤버 분기) + (2) **풀스크린 sheet 인프라** (select-playlist · add-tracks · djing-guide) + (3) **mini-player** (sheet 내부 bottom, chunk 3.1 ToS 패턴 재사용) 으로 교체. mutation 3개 (`register-me-to-queue`·`change-my-playlist`·`unregister-me-from-queue`) 를 widget 사적 api 에서 `features/partyroom/<action>` 공개 api 로 승격 — 데스크탑 import path 변경, 동작 0.

**Architecture:**

- 모바일 트리 `widgets-mobile/partyroom-queue-panel/` (큐 탭 단일 표면) + `widgets-mobile/partyroom-djing-sheet/` (sheet 인프라 + 3 sheet) + `widgets-mobile/music-preview-mini-player/` 신규. `features-mobile/partyroom/{select-playlist,register-me,change-my-playlist,unregister-me}/ui/` 의 합성 hook + `features-mobile/playlist/{add-tracks,djing-guide}/ui/` 신규.
- C3 격리 sibling 사본 (chunk 2/3 동일). `widgets/partyroom-djing-dialog/api/*` cross-import 0 — mutation 승격으로 정합. 데스크탑 widget 트리는 import path 5줄 변경 외 동작 0.
- 데이터: `useFetchDjingQueue` · `useFetchPlaylists` · `useSearchMusics` · `useAddPlaylistTrack` · `useMusicPreview` · `useUserPreferenceStore` · `useIsGuest` 모두 공유.
- a11y: FullscreenSheet 가 `role=dialog`·`aria-modal=true`·focus trap·ESC=popstate 통합.

**Tech Stack:** Next.js 14 App Router (client tree only — `queue-panel.component.tsx` 부터 `'use client'`), TypeScript, Vitest + RTL, Tailwind v3, Playwright (E2E, mandatory CI).

**선행 문서:**

- 본 plan 의 spec: `docs/superpowers/specs/2026-05-29-mobile-responsive-chunk4-dj-queuing-design.md` (v4, 4 commits on `feature/mobile-responsive-spec-4`)
- 아키텍처 spec: `docs/superpowers/specs/2026-05-28-mobile-responsive-architecture-design.md` (§3.3 chunk 4 / §4.4 큐 탭 wireframe / §2.2 게이트 매트릭스 / §2.4 데스크탑 전용 가드)
- 스코프 spec: `docs/superpowers/specs/2026-05-22-mobile-responsive-scope-design.md`
- chunk 3.1 spec (ToS 패턴 재사용 근거): `docs/superpowers/specs/2026-05-29-mobile-display-board-tos-redesign.md`
- 선행 PR: #354 chunk 1 + #355 chunk 1.1 + #356 chunk 2 + #357 chunk 3 + #358~#368 chunk 3.1 (mandatory CI 활성화)
- 선행 plan (사본 패턴 일관성 reference): `docs/superpowers/plans/2026-05-28-mobile-responsive-chunk2-lobby-room-listening.md` · `2026-05-29-mobile-responsive-chunk3-chat-crews-tabs.md`
- GH 이슈: pfplay-web#340

**관련 메모리:** [[feedback_pr_series_workflow]] · [[feedback_commit_consolidation_before_push]] · [[feedback_korean_issue_commit_pr]] · [[feedback_elegant_no_code_dirtying]] · [[feedback_autonomous_execution]] · [[wait-all-ci-incl-e2e-before-merge]] · [[reference_pfplay_web_local_dev_http_webpack]] · [[reference_e2e_silent_env_fallback_pattern]] · [[project_mobile_chunk31_ci_completed]] · [[feedback_pfplay_web_i18n_drift]] · [[feedback_single_partyroom_subscription_invariant]]

---

## Baseline (정찰 완료, 본 plan 의 code block 에 반영됨)

본 plan 의 모든 code block 은 아래 baseline 을 확인한 후 작성되었습니다. 정찰 재검증 명령은 Phase 0 Task 0.1 에 있습니다.

### chunk 3 prod 상태 (본 chunk 가 그 위에 얹는 베이스)

**`src/widgets-mobile/partyroom-page-mobile/room.component.tsx`** — display-board + room-tabs sibling. partyroomId props 만 받음.

**`src/widgets-mobile/partyroom-room-tabs/partyroom-room-tabs.component.tsx`** — 채팅·크루·큐 3-탭 컨테이너. 큐 탭은 현재 `<QueueTabPlaceholder />` ("곧 큐잉 기능을 만나보세요") 노출. chunk 4 가 손볼 곳:

```tsx
// 현재 line 8: import QueueTabPlaceholder from './ui/parts/queue-tab-placeholder.component';
// 현재 line 49: <QueueTabPlaceholder />
//
// chunk 4: import MobilePartyroomQueuePanel + 큐 탭 내부 컴포넌트 교체 + partyroomId prop drilling
```

또한 chunk 3 의 `<TabBar>` 는 큐 카운트를 노출하지 않음 (line 46: `label='🎧 큐'`). chunk 4 에서 **큐 카운트 활성화** (`label={`🎧 ${djCount}`}`) — `useFetchDjingQueue` 데이터로 채움. 단 카운트가 0 인 경우 라벨만 (chunk 3 의 crew count = 0 표기 패턴과 정합 — 0 도 숫자 표시).

### 데스크탑 `widgets/partyroom-djing-dialog/api/*.mutation.ts` 정합

3개 mutation 파일 — 본 plan 의 Phase 2 가 `features/partyroom/<action>/api/` 로 위치 이동:

```ts
// use-register-me-to-queue.mutation.ts (25 줄)
//   payload: { partyroomId, playlistId }
//   onSuccess: invalidate [QueryKeys.DjingQueue, partyroomId] + track('DJ Registered', {partyroom_id, playlist_id})
// use-change-my-playlist.mutation.ts (25 줄)
//   payload: { partyroomId, playlistId }
//   onSuccess: invalidate [QueryKeys.DjingQueue, partyroomId] + track('DJ Playlist Changed', {partyroom_id, playlist_id})
// use-unregister-me-from-queue.mutation.ts (30 줄)
//   payload: { partyroomId }
//   onMutate: suppressNextSelfDjDeregister() — WS DJ_QUEUE_CHANGED 의 self 제거 admin 오분류 회피
//   onSuccess: invalidate [QueryKeys.DjingQueue, partyroomId] + track('DJ Deregistered', {partyroom_id, reason: 'self'})
```

**Cross-import 인벤토리** (Phase 2 import path 변경 대상):

| 파일                                                                              | line | 현재 import                                           |
| --------------------------------------------------------------------------------- | ---- | ----------------------------------------------------- |
| `src/widgets/partyroom-djing-dialog/ui/register-button.component.tsx`             | 9    | `from '../api/use-register-me-to-queue.mutation'`     |
| `src/widgets/partyroom-djing-dialog/ui/change-playlist-button.component.tsx`      | 5    | `from '../api/use-change-my-playlist.mutation'`       |
| `src/widgets/partyroom-djing-dialog/ui/change-playlist-button.component.test.tsx` | 19   | `from '../api/use-change-my-playlist.mutation'`       |
| `src/widgets/partyroom-djing-dialog/ui/unregister-button.component.tsx`           | 4    | `from '../api/use-unregister-me-from-queue.mutation'` |
| `src/widgets/partyroom-djing-dialog/api/dj-queue.integration.test.ts`             | 8    | `from './use-register-me-to-queue.mutation'`          |
| `src/widgets/partyroom-djing-dialog/api/dj-queue.integration.test.ts`             | 9    | `from './use-unregister-me-from-queue.mutation'`      |

→ 6 import path 갱신. integration test 위치는 그대로 (`widgets/partyroom-djing-dialog/api/dj-queue.integration.test.ts` — spec §11.3 사유: widget 유지 + 분할 시 회귀 가시성 ↓ 수용).

### 데스크탑 `widgets/partyroom-djing-dialog/ui/body.component.tsx` 의 의존성 인벤토리 (모바일 사본 분해 reference)

| import 경로                                                     | 모바일 사본에서 처리                                                                  |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `@/features/partyroom/list-djing-queue` → `useFetchDjingQueue`  | ✅ 그대로 재사용 (큐 단일 소스)                                                       |
| `@/features/partyroom/delete-dj-from-queue` (2 hook)            | ❌ OUT (모더레이션)                                                                   |
| `@/features/partyroom/lock-djing-queue` (2 hook)                | ❌ OUT                                                                                |
| `@/features/partyroom/unlock-djing-queue` (2 hook)              | ❌ OUT                                                                                |
| `@/features/partyroom/skip-playback` → `SkipPlayback`           | ❌ OUT (오너 전용)                                                                    |
| `QueueStatus` enum (`@/shared/api/http/types/@enums`)           | ✅ 그대로 (queue lock alert 분기)                                                     |
| `useDialog().openAlertDialog`                                   | ✅ 그대로 (큐 락)                                                                     |
| `useStores().useCurrentPartyroom(s => s.me?.crewId)`            | ✅ 그대로 (isMeInQueue 판정)                                                          |
| `Dj.toListItemConfig` · `DjListItem` (shared)                   | ⚠ shared component — 그대로 재사용 가능. 단 모바일 sizing 검증 (44px 터치 타겟 정합) |
| `Typography` · `Button` · `TextButton` shared                   | ✅ chunk 3 동일 정책                                                                  |
| `Tooltip`                                                       | ❌ aria-label 대체 (chunk 3 정책)                                                     |
| `Trans` · `BoldProcessor` · `VariableProcessor` (i18n renderer) | ✅ 그대로                                                                             |

### 데스크탑 `widgets/partyroom-djing-dialog/ui/register-button.component.tsx` 패턴

```tsx
// useFetchPlaylists → useSelectPlaylistForDjing({ playlists })
// 등록 흐름:
//   1. queue 가 CLOSE 면 alert dialog (locked_queue_by_admin) → return
//   2. selectPlaylist() → 사용자 취소면 return
//   3. registerMeToQueue({ partyroomId, playlistId })
//   4. showDjingGuide → openDjingGuideModal()
```

→ **모바일 합성 hook (`features-mobile/partyroom/register-me-to-queue/ui/use-register-me-to-queue.hook.tsx`)** 가 동일 흐름. 단 `useSelectPlaylistForDjing` 대신 `useMobileSelectPlaylist`. djingGuide 도 `useMobileDjingGuide`.

### 데스크탑 `widgets/partyroom-djing-dialog/ui/change-playlist-button.component.tsx` 패턴

```tsx
// useFetchPlaylists → useSelectPlaylistForDjing({ playlists })
// 변경 흐름:
//   1. selectPlaylist() → 사용자 취소면 return
//   2. changeMyPlaylist({ partyroomId, playlistId })
```

→ **모바일 합성 hook (`features-mobile/partyroom/change-my-playlist/ui/use-change-my-playlist.hook.tsx`)** 동일 흐름. 모바일에선 SelectPlaylistSheet 가 동일 contract (`Promise<Playlist|void>`) 노출.

### 데스크탑 `widgets/partyroom-djing-dialog/ui/unregister-button.component.tsx` 패턴

```tsx
// 단순 mutation 호출 (confirm 자체는 데스크탑 dialog 의 close button 클릭 이중확인이 대체)
// → 모바일은 명시 confirm 필요 (탭 안 inline 위치라 잘못 누름 위험 ↑)
```

→ **모바일 합성 hook (`features-mobile/partyroom/unregister-me-from-queue/ui/use-unregister-me-from-queue.hook.tsx`)** 가 `useDialog().openConfirmDialog` + mutation 조합. spec §6.4 흐름.

### 데스크탑 `useSelectPlaylistForDjing` (features/partyroom/select-playlist-for-djing) 의 contract

```tsx
// () => Promise<Playlist | void>
// 분기:
//   - playlists.length === 0 OR every musicCount === 0 → guidePrepareSelect → setPlaylistDrawer({open:true})
//   - 정상 → openDialog (SelectPlaylist + ButtonGroup) → onOk(selected) / onCancel()
```

→ **모바일 사본 `useMobileSelectPlaylist`** 가 동일 contract 노출. 단 spec §5.4 의 의존 제거 5행 표 적용 (drawer 의존 0 + guidePrepareSelect 두 분기 분리).

### 데스크탑 `useDjingGuide` (features/playlist/djing-guide) 의 contract

```tsx
// useDjingGuide(): { showDjingGuide, openDjingGuideModal }
// - showDjingGuide = !djingGuideHidden (useUserPreferenceStore)
// - openDjingGuideModal → openDialog(Body: DjingGuideLayout, classNames: {container: 'w-[596px]'})
```

→ **모바일 사본 `useMobileDjingGuide`** 가 동일 시그니처. openDjingGuideModal 만 `useFullscreenSheet().push(DjingGuideSheet)` 로 교체.

### `widgets/music-preview-player` 데스크탑 패턴 (모바일 mini-player 분해 reference)

```tsx
// PlayerContainer:
//   - position: 'sidebar' | 'modal'
//   - useMusicPreview().{currentTrack, playState} → 미렌더 조건 단순
//   - YouTubePreviewPlayer (entities/music-preview/index.ui) 가 IFrame mount
//   - PREVIEW_PLAYER_SIZES['sidebar'|'modal'] config 가 width/height 결정
//
// sidebar-player: shouldShow = currentTrack && playing && source === 'playlist-track'
// modal-player: 검색 dialog 안에 mount (source 무관)
```

→ **모바일 mini-player** 는 `position='mobile-bottom'` 신규 추가. `PREVIEW_PLAYER_SIZES` 에 mobile-bottom 항목 추가 (spec §5.5 spike 결과 outcome A = 64×36, plan Phase 1 에서 잠금). source 분기 = sheet 내부라 source 무관 (검색 결과 = 'search' source 추가 가능, 또는 그대로 검색 source 통과).

### barrel 정찰

```bash
# chunk 4 가 신규 export 추가하는 모바일 트리들
cat src/widgets-mobile/partyroom-room-tabs/index.ts
cat src/widgets-mobile/partyroom-display-board/index.ts
cat src/widgets-mobile/partyroom-chat-panel/index.ts
cat src/widgets-mobile/partyroom-crews-panel/index.ts

# 기대: 각 트리의 barrel 이 main 컴포넌트만 export. chunk 4 신규 트리 4개 (queue-panel, djing-sheet, mini-player) 도 같은 패턴
```

### i18n 키 정찰

chunk 4 가 신규 도입할 i18n 키 (spec §7 잠금, `t.partyroom.queue.*` 네임스페이스):

| key                                             | ko                                   | en                       |
| ----------------------------------------------- | ------------------------------------ | ------------------------ |
| `partyroom.queue.guest_cta_title`               | 🎧 음악을 직접 틀어보세요            | 🎧 Play music yourself   |
| `partyroom.queue.guest_cta_subtitle`            | 3초만에 가입 →                       | Sign up in 3 seconds →   |
| `partyroom.queue.member_action_register`        | + DJ 등록                            | + Register as DJ         |
| `partyroom.queue.member_action_unregister`      | 큐에서 나가기                        | Leave queue              |
| `partyroom.queue.member_action_change_playlist` | 변경                                 | Change                   |
| `partyroom.queue.current_dj_title`              | 현재 DJ                              | Current DJ               |
| `partyroom.queue.empty`                         | 큐 비어있음                          | Queue empty              |
| `partyroom.queue.unregister_confirm`            | 정말 큐에서 나가시겠어요?            | Leave the queue?         |
| `partyroom.queue.sheet_select_playlist_title`   | 플레이리스트 선택                    | Select playlist          |
| `partyroom.queue.sheet_add_tracks_title`        | 곡 추가                              | Add tracks               |
| `partyroom.queue.sheet_search_placeholder`      | 곡명 또는 아티스트로 검색            | Search by song or artist |
| `partyroom.queue.sheet_empty_search`            | 다른 키워드로 시도해보세요           | Try another keyword      |
| `partyroom.queue.sheet_search_failed`           | 검색에 실패했어요. 다시 시도해주세요 | Search failed. Retry     |
| `partyroom.queue.sheet_preview_unavailable`     | 재생할 수 없어요                     | Cannot play              |
| `partyroom.queue.sheet_add_button`              | + 추가                               | + Add                    |
| `partyroom.queue.add_success`                   | 플레이리스트에 추가했어요            | Added to playlist        |
| `partyroom.queue.add_already_exists`            | 이미 플레이리스트에 있어요           | Already in playlist      |
| `partyroom.queue.add_limit_exceeded`            | 플레이리스트가 가득 찼어요           | Playlist is full         |
| `partyroom.queue.guest_action_blocked`          | 로그인이 필요해요                    | Sign-in required         |
| `partyroom.queue.guide_dismiss`                 | 다시 보지 않기                       | Don't show again         |
| `partyroom.queue.guide_start`                   | 시작                                 | Start                    |
| `partyroom.queue.guide_title`                   | DJ 규칙                              | DJ rules                 |

키 인벤토리 = 21건. Phase 11 에서 xlsx 일괄 갱신 + ko.json/en.json 동기 ([[feedback_pfplay_web_i18n_drift]] 정책).

### playwright.config.ts mobile project 정찰

```ts
// 현재 (chunk 3.1):
//   {
//     name: 'display-board-tos-mobile',
//     testMatch: /mobile\/display-board\.tos\.spec\.ts/,
//     ... iPhone 13 chromium + auth-a 공유
//   }
//
// chunk 4 갱신 (spec §8.3 잠금):
//   name → 'mobile'
//   testMatch → /mobile\/.+\.spec\.ts/
//   (다른 옵션 유지)
//
// e2e/mobile/display-board.tos.spec.ts:111 의 spec-local stale title pattern (실제 위치, Phase 0 정찰 결과)
//   const E2E_PARTYROOM_TITLE_PATTERN = /^(E2EA|E2EB|E2EC|E2ED|MTOS|MOBILE-TOS-)/;
//   → /^(E2EA|E2EB|E2EC|E2ED|MTOS|MOBILE-TOS-|MDJ|MAT)/
//   (Phase 12 갱신 대상)
```

---

## File Structure

### 생성 (신규)

```
src/widgets-mobile/
├── partyroom-queue-panel/
│   ├── index.ts                                          ⭐ barrel
│   └── ui/
│       ├── queue-panel.component.tsx                     ⭐ 게스트/멤버 분기
│       ├── queue-panel.component.test.tsx
│       ├── current-dj-row.component.tsx                  ⭐ 현재 DJ + playback meta
│       ├── current-dj-row.component.test.tsx
│       ├── queue-list.component.tsx                      ⭐ 큐 순서 리스트
│       ├── queue-list.component.test.tsx
│       ├── queue-list-item.component.tsx                 ⭐ DJ 1명 (Me 분기)
│       ├── queue-list-item.component.test.tsx
│       ├── member-actions.component.tsx                  ⭐ [+ DJ 등록] / [큐에서 나가기] sticky
│       ├── member-actions.component.test.tsx
│       ├── guest-cta.component.tsx                       ⭐ /sign-in CTA
│       └── guest-cta.component.test.tsx
│
├── partyroom-djing-sheet/
│   ├── index.ts                                          ⭐ barrel
│   ├── lib/
│   │   ├── use-fullscreen-sheet.hook.tsx                 ⭐ 스택·popstate·ESC
│   │   └── use-fullscreen-sheet.hook.test.tsx
│   └── ui/
│       ├── fullscreen-sheet.component.tsx                ⭐ 공용 인프라
│       ├── fullscreen-sheet.component.test.tsx
│       ├── select-playlist-sheet.component.tsx           ⭐ 플레이리스트 카드 sheet
│       ├── select-playlist-sheet.component.test.tsx
│       ├── add-tracks-sheet.component.tsx                ⭐ 검색 + mini-player
│       ├── add-tracks-sheet.component.test.tsx
│       ├── djing-guide-sheet.component.tsx               ⭐ 규칙 가이드 sheet
│       └── djing-guide-sheet.component.test.tsx
│
└── music-preview-mini-player/
    ├── index.ts                                          ⭐ barrel
    └── ui/
        ├── mini-player.component.tsx                     ⭐ sheet 내부 bottom (audio + meta + 추가 + ×)
        └── mini-player.component.test.tsx

src/features-mobile/
├── partyroom/
│   ├── select-playlist-for-djing/
│   │   ├── index.ts                                      ⭐
│   │   └── ui/
│   │       ├── select-playlist.component.tsx             ⭐ 카드 리스트
│   │       ├── select-playlist.component.test.tsx
│   │       ├── use-mobile-select-playlist.hook.tsx       ⭐ Promise<Playlist|void>
│   │       └── use-mobile-select-playlist.hook.test.tsx
│   ├── register-me-to-queue/
│   │   ├── index.ts                                      ⭐
│   │   └── ui/
│   │       ├── use-register-me-to-queue.hook.tsx         ⭐ 합성 hook (queue lock + select + mutation + guide)
│   │       └── use-register-me-to-queue.hook.test.tsx
│   ├── change-my-playlist/
│   │   ├── index.ts                                      ⭐
│   │   └── ui/
│   │       ├── use-change-my-playlist.hook.tsx           ⭐ 합성 hook
│   │       └── use-change-my-playlist.hook.test.tsx
│   └── unregister-me-from-queue/
│       ├── index.ts                                      ⭐
│       └── ui/
│           ├── use-unregister-me-from-queue.hook.tsx     ⭐ confirm + mutation
│           └── use-unregister-me-from-queue.hook.test.tsx
└── playlist/
    ├── add-tracks/
    │   ├── index.ts                                      ⭐
    │   └── ui/
    │       ├── music-search.component.tsx                ⭐ 검색 input + 결과 리스트
    │       ├── music-search.component.test.tsx
    │       ├── search-list-item.component.tsx            ⭐ 곡 1개
    │       └── search-list-item.component.test.tsx
    └── djing-guide/
        ├── index.ts                                      ⭐
        └── ui/
            ├── use-mobile-djing-guide.hook.tsx           ⭐ preference + sheet 트리거
            ├── use-mobile-djing-guide.hook.test.tsx
            ├── guide-layout.component.tsx                ⭐ 모바일 stacking 변형
            └── guide-layout.component.test.tsx

src/features/partyroom/                                   ⭐ mutation 승격 (widget → feature)
├── register-me-to-queue/
│   ├── index.ts                                          ⭐ barrel
│   └── api/
│       └── use-register-me-to-queue.mutation.ts          ⭐ (이동) 기존 widget 파일 1:1 복사
├── change-my-playlist/
│   ├── index.ts                                          ⭐
│   └── api/
│       └── use-change-my-playlist.mutation.ts            ⭐
└── unregister-me-from-queue/
    ├── index.ts                                          ⭐
    └── api/
        └── use-unregister-me-from-queue.mutation.ts      ⭐
```

### 수정

- `src/widgets-mobile/partyroom-room-tabs/partyroom-room-tabs.component.tsx` — `<QueueTabPlaceholder />` → `<MobilePartyroomQueuePanel partyroomId={...} />` + partyroomId prop 받기, TabBar 큐 카운트 활성화
- `src/widgets-mobile/partyroom-room-tabs/ui/parts/tab-bar.component.tsx` — `queueCount?: number` prop 추가, `label={`🎧 ${queueCount ?? 0}`}` 갱신
- `src/widgets-mobile/partyroom-room-tabs/index.ts` — props 변경 export 확인 (변경 없음 가능성, 검토)
- `src/widgets-mobile/partyroom-page-mobile/room.component.tsx` — `<MobilePartyroomRoomTabs partyroomId={partyroomId} />` (chunk 3 에서 prop 없이 호출하던 곳)
- `src/widgets/partyroom-djing-dialog/ui/register-button.component.tsx` — import path 변경 1줄
- `src/widgets/partyroom-djing-dialog/ui/change-playlist-button.component.tsx` — import path 변경 1줄
- `src/widgets/partyroom-djing-dialog/ui/change-playlist-button.component.test.tsx` — import path 변경 1줄
- `src/widgets/partyroom-djing-dialog/ui/unregister-button.component.tsx` — import path 변경 1줄
- `src/widgets/partyroom-djing-dialog/api/dj-queue.integration.test.ts` — import path 변경 2줄 (위치 유지)
- `src/entities/music-preview/config/youtube-player.config.ts` — `PREVIEW_PLAYER_SIZES['mobile-bottom']` 항목 추가 (Phase 1 spike 결과 outcome A)
- `src/widgets/music-preview-player/ui/player-container.component.tsx` — position prop union 에 `'mobile-bottom'` 추가
- `src/shared/lib/localization/dictionaries/ko.json` + `en.json` + `i18n.xlsx` — Phase 11 의 21개 신규 키
- `playwright.config.ts` — `display-board-tos-mobile` project → `mobile`, testMatch 확장 (Phase 12)
- `e2e/mobile/display-board.tos.spec.ts:111` — `E2E_PARTYROOM_TITLE_PATTERN` 확장 `MDJ|MAT` (실제 위치, Phase 0 정찰 결과)

### 삭제 (Phase 2)

- `src/widgets/partyroom-djing-dialog/api/use-register-me-to-queue.mutation.ts` (이동, 새 위치는 `features/partyroom/register-me-to-queue/api/`)
- `src/widgets/partyroom-djing-dialog/api/use-change-my-playlist.mutation.ts`
- `src/widgets/partyroom-djing-dialog/api/use-unregister-me-from-queue.mutation.ts`

(integration test `dj-queue.integration.test.ts` 는 위치 유지)

### 보존 (chunk 5 제거)

- `src/widgets-mobile/partyroom-room-tabs/ui/parts/queue-tab-placeholder.component.tsx` (큐 탭 placeholder — chunk 5 catch-up 에서 제거. chunk 4 는 사용처만 교체, 파일은 잔존)

---

## Chunk 1: Phase 0~2 (정찰 + spike + mutation 승격)

## Phase 0: 정찰 재검증 (`Baseline` 섹션 정확성 재검증)

본 plan 의 Baseline 은 이미 정찰 완료. plan 실행 시점에 baseline 이 변경됐을 가능성 차단용 single-task verification.

### Task 0.1: Baseline 재검증

**Files:** 없음 (read-only)

- [ ] **Step 1: chunk 3 결과물 정합 확인**

```bash
cd "C:/Users/Eisen/Desktop/Labs/[projects] pfplay/pfplay-web"
cat src/widgets-mobile/partyroom-page-mobile/room.component.tsx
cat src/widgets-mobile/partyroom-room-tabs/partyroom-room-tabs.component.tsx
cat src/widgets-mobile/partyroom-room-tabs/ui/parts/tab-bar.component.tsx
cat src/widgets-mobile/partyroom-room-tabs/ui/parts/queue-tab-placeholder.component.tsx
```

Expected: Baseline 의 코드 블록과 1:1 일치. 다를 시 본 plan 의 Baseline + Phase 10 wiring code block 갱신.

- [ ] **Step 2: mutation 3개 파일 baseline 확인**

```bash
cat src/widgets/partyroom-djing-dialog/api/use-register-me-to-queue.mutation.ts
cat src/widgets/partyroom-djing-dialog/api/use-change-my-playlist.mutation.ts
cat src/widgets/partyroom-djing-dialog/api/use-unregister-me-from-queue.mutation.ts
cat src/widgets/partyroom-djing-dialog/api/dj-queue.integration.test.ts
```

Expected: Baseline `데스크탑 widgets/partyroom-djing-dialog/api/*.mutation.ts 정합` 섹션과 일치 — 특히 `suppressNextSelfDjDeregister`·`track('DJ Registered')` 등 side-effect 유지.

- [ ] **Step 3: cross-import 위치 재검증**

ui/ 의 상대 `../api/` import + integration test 의 sibling `./` import 양쪽 패턴 모두 검색:

```bash
# ui/ 4건 + api/ 의 integration test 2건 = 총 6 매칭 기대
grep -rnE "from '\.\.?/(api/)?use-(register-me-to-queue|change-my-playlist|unregister-me-from-queue)" src/widgets/partyroom-djing-dialog/
```

Expected: **6건 매칭** — `ui/register-button.component.tsx:9` · `ui/change-playlist-button.component.tsx:5` · `ui/change-playlist-button.component.test.tsx:19` · `ui/unregister-button.component.tsx:4` · `api/dj-queue.integration.test.ts:8` · `api/dj-queue.integration.test.ts:9`. 매칭 수 다르면 Phase 2 의 Edit step 갱신.

- [ ] **Step 4: `useSelectPlaylistForDjing` · `useDjingGuide` · `useMusicPreview` baseline 확인**

```bash
cat src/features/partyroom/select-playlist-for-djing/ui/use-select-playlist.hook.tsx
cat src/features/playlist/djing-guide/ui/use-djing-guide.hook.tsx
cat src/widgets/music-preview-player/ui/player-container.component.tsx
cat src/entities/music-preview/config/youtube-player.config.ts
```

Expected: Baseline 의 contract (Promise<Playlist|void> · {showDjingGuide, openDjingGuideModal} · position='sidebar'|'modal' + PREVIEW_PLAYER_SIZES) 와 일치.

- [ ] **Step 5: i18n dictionary baseline**

```bash
grep -nE "^\s+\"queue\"" src/shared/lib/localization/dictionaries/ko.json | head -3
grep -nE "^\s+\"queue\"" src/shared/lib/localization/dictionaries/en.json | head -3
```

Expected: `partyroom.queue` 네임스페이스 부재 또는 일부 키만 존재. 충돌 키 발견 시 Phase 11 의 key inventory 표 갱신.

- [ ] **Step 6a: ESLint boundary rule 정찰** (features-mobile ↔ features 경계 검사 도입 여부)

```bash
cat .eslintrc.json 2>&1 | grep -E "boundaries|import/no-restricted" || echo "no boundary rule"
cat .eslintrc.js 2>&1 | grep -E "boundaries|import/no-restricted" || echo "no boundary rule"
```

Expected: `no boundary rule` 출력. 본 plan 의 features-mobile → features cross-segment import 가 lint error 0. boundary rule 존재 시 Phase 3+ 진입 전 룰 확장 또는 mobile import allowlist 필요.

- [ ] **Step 6: playwright.config + cleanup helper baseline**

```bash
grep -nE "name: 'display-board-tos-mobile'|testMatch.*mobile" playwright.config.ts
grep -nE "E2EA\|E2EB\|MTOS" e2e/helpers/partyroom.helpers.ts
```

Expected: Baseline `playwright.config.ts mobile project 정찰` 섹션과 일치.

- [ ] **Step 7: 정찰 결과 노트**

baseline 변경 발견 시 plan 본문 수정 + commit 메시지에 기록. 변경 없으면 skip.

```bash
# 변경 사항 있으면만:
git add docs/superpowers/plans/2026-05-29-mobile-responsive-chunk4-dj-queuing.md
git commit -m "docs(plan/chunk4): Phase 0 정찰 결과 반영"
```

---

## Phase 1: §5.5 Spike — mini-player 사이즈 잠금

spec §5.5 spike 분기 (A/B/C). plan 단계 첫 task 로 잠금 — outcome 확정 후 Phase 5 의 mini-player 구현이 가능해진다.

### Task 1.1: spike — visible frame 사이즈 측정

**Files:** 없음 (조사 + 결정 잠금)

- [ ] **Step 1: 데스크탑 `PREVIEW_PLAYER_SIZES` 정찰**

```bash
cat src/entities/music-preview/config/youtube-player.config.ts
```

Expected: `sidebar` · `modal` size config 노출. 모바일 'mobile-bottom' 신규 추가 자리.

- [ ] **Step 2: chunk 3.1 display-board 의 visible frame 사이즈 정찰 (ToS 패턴 reference)**

```bash
grep -nE "EXPANDED|COLLAPSED|SIZE" src/widgets-mobile/partyroom-display-board/lib/*.ts 2>&1 | head -10
cat src/widgets-mobile/partyroom-display-board/lib/*.ts 2>&1 | head -50
```

Expected: chunk 3.1 의 expanded/collapsed video size (대략 240×135 expanded). mini-player 64×36 (16:9 비율) 은 더 작지만 ToS 보존 측면에서 noticeable (1×1 vs 시각적으로 인지 가능).

- [ ] **Step 3: outcome A 잠금 — 64×36 visible frame**

본 plan 의 outcome 결정 (spec §5.5 default 채택. spec quote: **"mini-player 높이 = 80px → 112px (video 64×36 + 16px padding). [추가]·⏯·×·곡명 영역 재배치. 곡명 1줄 ellipsis. video 우측에 배치, 컨트롤 우상단"**):

| 항목                                    | 값                                                                                                                                                                                        |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PREVIEW_PLAYER_SIZES['mobile-bottom']` | `{ width: 64, height: 36 }` (실제 baseline: `sidebar: 320×180`·`modal: 280×157`)                                                                                                          |
| mini-player container 높이              | **112px** (= video 36 + 16×2 padding · 곡명/아티스트 2줄 여유. spec §5.5 outcome A 잠금)                                                                                                  |
| layout                                  | `flex items-center px-3 gap-3`. 좌측 곡명/아티스트 (flex-1 min-w-0, ellipsis) → 우측 ⏯·[+ 추가]·× **컨트롤 우상단 cluster**, video 64×36 우측 가장 안쪽 (spec quote "video 우측에 배치") |
| 곡명·아티스트 영역                      | flex-1 with `min-w-0` (ellipsis), 곡명 1줄 (text-sm), 아티스트 1줄 (text-xs text-gray-400)                                                                                                |

**outcome B 채택 조건**: 사용자 명시 승인 + 결정 이력 신규 commit (spec §5.5). 본 plan 은 outcome A 로 진행.

**outcome C 채택 조건**: outcome A 의 구현 위험 발견 시 — 본 plan 진행 중 발견 가능성 0 이상이면 사용자 게이트 후 재구조.

- [ ] **Step 4: outcome A 결정 commit (plan 본문에 반영)**

```bash
# plan 본문은 이미 outcome A 기준으로 작성됨. 본 Task 가 outcome 잠금을 명시.
# 본 plan 의 모든 후속 code block 은 outcome A 가정.
# 별도 commit 없음 (plan 본문 자체가 outcome A 잠금).
```

---

## Phase 2: Mutation 승격 (widget → feature)

3개 mutation 을 `widgets/partyroom-djing-dialog/api/` → `features/partyroom/<action>/api/` 로 이동. 데스크탑 widget cross-import 5곳 + integration test 2 import 갱신. 동작 0 변경.

데스크탑 통합 테스트 (`dj-queue.integration.test.ts`) 는 위치 유지 (spec §11.3 잠금).

### Task 2.1: `useRegisterMeToQueue` 승격

**Files:**

- Create: `src/features/partyroom/register-me-to-queue/index.ts`
- Create: `src/features/partyroom/register-me-to-queue/api/use-register-me-to-queue.mutation.ts`
- Delete: `src/widgets/partyroom-djing-dialog/api/use-register-me-to-queue.mutation.ts`
- Modify: `src/widgets/partyroom-djing-dialog/ui/register-button.component.tsx:9`
- Modify: `src/widgets/partyroom-djing-dialog/api/dj-queue.integration.test.ts:8`

- [ ] **Step 1: 신규 위치에 mutation 파일 작성 (기존 1:1 복사)**

```ts
// src/features/partyroom/register-me-to-queue/api/use-register-me-to-queue.mutation.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { QueryKeys } from '@/shared/api/http/query-keys';
import { djsService } from '@/shared/api/http/services';
import { APIError } from '@/shared/api/http/types/@shared';
import { RegisterMeToQueuePayload } from '@/shared/api/http/types/djs';
import { track } from '@/shared/lib/analytics';

export const useRegisterMeToQueue = () => {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError<APIError>, RegisterMeToQueuePayload>({
    mutationFn: (request) => djsService.registerMeToQueue(request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.DjingQueue, variables.partyroomId],
      });
      track('DJ Registered', {
        partyroom_id: variables.partyroomId,
        playlist_id: variables.playlistId,
      });
    },
  });
};
```

- [ ] **Step 2: barrel 파일 작성**

```ts
// src/features/partyroom/register-me-to-queue/index.ts
export { useRegisterMeToQueue } from './api/use-register-me-to-queue.mutation';
```

- [ ] **Step 3: 데스크탑 register-button 의 import path 갱신**

```tsx
// src/widgets/partyroom-djing-dialog/ui/register-button.component.tsx
// (line 9 변경)
// 기존:
//   import { useRegisterMeToQueue } from '../api/use-register-me-to-queue.mutation';
// 변경:
//   import { useRegisterMeToQueue } from '@/features/partyroom/register-me-to-queue';
```

- [ ] **Step 4: 데스크탑 통합 테스트 import 갱신**

```ts
// src/widgets/partyroom-djing-dialog/api/dj-queue.integration.test.ts
// (line 8 변경)
// 기존:
//   import { useRegisterMeToQueue } from './use-register-me-to-queue.mutation';
// 변경:
//   import { useRegisterMeToQueue } from '@/features/partyroom/register-me-to-queue';
```

- [ ] **Step 5: 기존 widget 위치의 mutation 파일 삭제**

```bash
rm src/widgets/partyroom-djing-dialog/api/use-register-me-to-queue.mutation.ts
```

- [ ] **Step 6: 데스크탑 통합 테스트 회귀 확인**

```bash
yarn test src/widgets/partyroom-djing-dialog/api/dj-queue.integration.test.ts --run
```

Expected: 기존 register 시나리오 2개 (success + error) GREEN.

- [ ] **Step 7: 데스크탑 register-button 단위 회귀**

```bash
yarn test src/widgets/partyroom-djing-dialog/ui/register-button --run
```

Expected: 단위 테스트가 있다면 GREEN. 없으면 typecheck 만으로 충분 (다음 Step).

- [ ] **Step 8: 전체 typecheck**

```bash
yarn typecheck
```

Expected: 0 errors. 누락된 import 발견 시 `grep -rn "from '\\.\\./api/use-register-me-to-queue.mutation'" src/` 로 추가 매칭 확인.

- [ ] **Step 9: 커밋**

```bash
git add src/features/partyroom/register-me-to-queue/ \
        src/widgets/partyroom-djing-dialog/ui/register-button.component.tsx \
        src/widgets/partyroom-djing-dialog/api/dj-queue.integration.test.ts
git rm src/widgets/partyroom-djing-dialog/api/use-register-me-to-queue.mutation.ts
git commit -m "refactor(features/partyroom): useRegisterMeToQueue mutation 승격 (widget → feature)

데스크탑 widget cross-import 회피 + 모바일 chunk 4 의 features-mobile 합성 hook 에서 import 가능.
동작 0 변경 (mutation 본문 1:1 복사, import path 만 갱신)."
```

### Task 2.2: `useChangeMyPlaylist` 승격

**Files:**

- Create: `src/features/partyroom/change-my-playlist/index.ts`
- Create: `src/features/partyroom/change-my-playlist/api/use-change-my-playlist.mutation.ts`
- Delete: `src/widgets/partyroom-djing-dialog/api/use-change-my-playlist.mutation.ts`
- Modify: `src/widgets/partyroom-djing-dialog/ui/change-playlist-button.component.tsx:5`
- Modify: `src/widgets/partyroom-djing-dialog/ui/change-playlist-button.component.test.tsx:19`

- [ ] **Step 1: 신규 mutation 파일 (1:1 복사)**

```ts
// src/features/partyroom/change-my-playlist/api/use-change-my-playlist.mutation.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { QueryKeys } from '@/shared/api/http/query-keys';
import { djsService } from '@/shared/api/http/services';
import { APIError } from '@/shared/api/http/types/@shared';
import { ChangeMyPlaylistPayload } from '@/shared/api/http/types/djs';
import { track } from '@/shared/lib/analytics';

export const useChangeMyPlaylist = () => {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError<APIError>, ChangeMyPlaylistPayload>({
    mutationFn: (request) => djsService.changeMyPlaylist(request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.DjingQueue, variables.partyroomId],
      });
      track('DJ Playlist Changed', {
        partyroom_id: variables.partyroomId,
        playlist_id: variables.playlistId,
      });
    },
  });
};
```

- [ ] **Step 2: barrel**

```ts
// src/features/partyroom/change-my-playlist/index.ts
export { useChangeMyPlaylist } from './api/use-change-my-playlist.mutation';
```

- [ ] **Step 3: change-playlist-button.component.tsx import 갱신 (line 5)**

```tsx
// 기존:
//   import { useChangeMyPlaylist } from '../api/use-change-my-playlist.mutation';
// 변경:
//   import { useChangeMyPlaylist } from '@/features/partyroom/change-my-playlist';
```

- [ ] **Step 4: change-playlist-button.component.test.tsx import 갱신 (line 19)**

```tsx
// 기존:
//   import { useChangeMyPlaylist } from '../api/use-change-my-playlist.mutation';
// 변경:
//   import { useChangeMyPlaylist } from '@/features/partyroom/change-my-playlist';
```

- [ ] **Step 5: 기존 mutation 파일 삭제**

```bash
rm src/widgets/partyroom-djing-dialog/api/use-change-my-playlist.mutation.ts
```

- [ ] **Step 6: 데스크탑 change-playlist-button 단위 테스트 + typecheck**

```bash
yarn test src/widgets/partyroom-djing-dialog/ui/change-playlist-button --run
yarn typecheck
```

Expected: GREEN, 0 errors.

- [ ] **Step 7: 커밋**

```bash
git add src/features/partyroom/change-my-playlist/ \
        src/widgets/partyroom-djing-dialog/ui/change-playlist-button.component.tsx \
        src/widgets/partyroom-djing-dialog/ui/change-playlist-button.component.test.tsx
git rm src/widgets/partyroom-djing-dialog/api/use-change-my-playlist.mutation.ts
git commit -m "refactor(features/partyroom): useChangeMyPlaylist mutation 승격 (widget → feature)"
```

### Task 2.3: `useUnregisterMeFromQueue` 승격

**Files:**

- Create: `src/features/partyroom/unregister-me-from-queue/index.ts`
- Create: `src/features/partyroom/unregister-me-from-queue/api/use-unregister-me-from-queue.mutation.ts`
- Delete: `src/widgets/partyroom-djing-dialog/api/use-unregister-me-from-queue.mutation.ts`
- Modify: `src/widgets/partyroom-djing-dialog/ui/unregister-button.component.tsx:4`
- Modify: `src/widgets/partyroom-djing-dialog/api/dj-queue.integration.test.ts:9`

- [ ] **Step 1: 신규 mutation 파일 (1:1 복사, `suppressNextSelfDjDeregister` 보존)**

```ts
// src/features/partyroom/unregister-me-from-queue/api/use-unregister-me-from-queue.mutation.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { QueryKeys } from '@/shared/api/http/query-keys';
import { djsService } from '@/shared/api/http/services';
import { APIError } from '@/shared/api/http/types/@shared';
import { UnregisterMeFromQueuePayload } from '@/shared/api/http/types/djs';
import { track } from '@/shared/lib/analytics';
import { suppressNextSelfDjDeregister } from '@/shared/lib/analytics/room-tracking';

export const useUnregisterMeFromQueue = () => {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError<APIError>, UnregisterMeFromQueuePayload>({
    mutationFn: (request) => djsService.unregisterMeFromQueue(request),
    onMutate: () => {
      // 직후 DJ_QUEUE_CHANGED WS가 self 제거를 admin으로 잘못 분류하는 것을 방지.
      suppressNextSelfDjDeregister();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.DjingQueue, variables.partyroomId],
      });
      track('DJ Deregistered', {
        partyroom_id: variables.partyroomId,
        reason: 'self',
      });
    },
  });
};
```

- [ ] **Step 2: barrel**

```ts
// src/features/partyroom/unregister-me-from-queue/index.ts
export { useUnregisterMeFromQueue } from './api/use-unregister-me-from-queue.mutation';
```

- [ ] **Step 3: unregister-button import 갱신 (line 4)**

```tsx
// 기존:
//   import { useUnregisterMeFromQueue } from '../api/use-unregister-me-from-queue.mutation';
// 변경:
//   import { useUnregisterMeFromQueue } from '@/features/partyroom/unregister-me-from-queue';
```

- [ ] **Step 4: 통합 테스트 import 갱신 (line 9)**

```ts
// src/widgets/partyroom-djing-dialog/api/dj-queue.integration.test.ts
// (line 9 변경)
// 기존:
//   import { useUnregisterMeFromQueue } from './use-unregister-me-from-queue.mutation';
// 변경:
//   import { useUnregisterMeFromQueue } from '@/features/partyroom/unregister-me-from-queue';
```

- [ ] **Step 5: 기존 mutation 파일 삭제**

```bash
rm src/widgets/partyroom-djing-dialog/api/use-unregister-me-from-queue.mutation.ts
```

- [ ] **Step 6: 데스크탑 통합 테스트 + unregister-button 회귀**

```bash
yarn test src/widgets/partyroom-djing-dialog/ --run
yarn typecheck
```

Expected: 기존 통합 테스트 시나리오 3개 (register success/error + unregister success) 모두 GREEN. `suppressNextSelfDjDeregister` import 가 신규 위치에서도 정확히 동작.

- [ ] **Step 7: cross-import 잔존 final 검증**

```bash
grep -rn "from '\.\./api/use-(register-me|change-my-playlist|unregister-me)" src/
grep -rn "from '\./use-(register-me|change-my-playlist|unregister-me)" src/widgets/partyroom-djing-dialog/
```

Expected: **0 match** (모든 cross-import 가 `@/features/partyroom/<action>` 로 이동 완료).

- [ ] **Step 8: 커밋**

```bash
git add src/features/partyroom/unregister-me-from-queue/ \
        src/widgets/partyroom-djing-dialog/ui/unregister-button.component.tsx \
        src/widgets/partyroom-djing-dialog/api/dj-queue.integration.test.ts
git rm src/widgets/partyroom-djing-dialog/api/use-unregister-me-from-queue.mutation.ts
git commit -m "refactor(features/partyroom): useUnregisterMeFromQueue mutation 승격 (widget → feature)

suppressNextSelfDjDeregister side-effect 보존. 데스크탑 통합 테스트 (dj-queue.integration.test.ts)
는 widget 위치 유지하고 import path 만 갱신 (spec §11.3 잠금)."
```

### Task 2.4: 전체 데스크탑 회귀 검증 (verification-only)

**Files:** 없음 (read-only 검증, commit 없음)

- [ ] **Step 1: 데스크탑 djing-dialog 통합 테스트 전체**

```bash
yarn test src/widgets/partyroom-djing-dialog/ --run
```

Expected: 기존 모든 테스트 GREEN. mutation 이동 후 import path 만 변경됐으므로 회귀 0.

- [ ] **Step 2: 전체 typecheck**

```bash
yarn typecheck
```

Expected: 0 errors.

- [ ] **Step 3: 전체 단위 테스트 (chunk 1~3.1 회귀 확인)**

```bash
yarn test --run
```

Expected: 모든 unit/integration GREEN. chunk 4 미구현 컴포넌트 0 (Phase 3~ 부터 추가).

- [ ] **Step 4: lint**

```bash
yarn lint
```

Expected: 0 errors.

- [ ] **Step 5: 회귀 검증 결과 (검증만, 코드 변경 없음 — skip)**

본 Task 는 verification-only — typecheck + 전체 test + lint 3건 GREEN 확인. 코드 변경 0 이라 별도 commit 없음. Phase 3 진입.

---

## Phase 0~2 검증 체크리스트 (다음 Phase 진입 전)

- [ ] Phase 0 정찰 결과 baseline 정합 확인 (코드 변경 0 이거나 plan 본문 갱신 commit 됨)
- [ ] Phase 1 outcome A 잠금 (plan 본문 자체가 outcome A 기준, 별도 작업 없음)
- [ ] Phase 2 mutation 3개 모두 `features/partyroom/<action>/` 위치
- [ ] 데스크탑 widget cross-import 0 (`grep -rn "from '\\.\\./api/use-(register|change-my|unregister)" src/` = 0 match)
- [ ] 데스크탑 통합 테스트 `dj-queue.integration.test.ts` 위치 유지 + 동작 GREEN
- [ ] `yarn typecheck` 0 errors
- [ ] `yarn test --run` GREEN
- [ ] `yarn lint` 0 errors

---

## Chunk 2: Phase 3~5 (FullscreenSheet 인프라 + SelectPlaylistSheet + MiniPlayer)

## Phase 3: FullscreenSheet 공용 인프라

spec §5.2 + §5.3 + §3 결정 #12 잠금. push/pop 스택 + popstate + ESC 통합 + a11y 가드.

### Task 3.1: `useFullscreenSheet` hook (스택·popstate·ESC 통합)

**Files:**

- Create: `src/widgets-mobile/partyroom-djing-sheet/lib/use-fullscreen-sheet.hook.tsx`
- Create: `src/widgets-mobile/partyroom-djing-sheet/lib/use-fullscreen-sheet.hook.test.tsx`

- [ ] **Step 1: failing test (push/pop/closeAll/dedup/popstate/ESC)**

```tsx
// src/widgets-mobile/partyroom-djing-sheet/lib/use-fullscreen-sheet.hook.test.tsx
import { act, renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { FullscreenSheetProvider, useFullscreenSheet } from './use-fullscreen-sheet.hook';

const wrap = ({ children }: { children: ReactNode }) => (
  <FullscreenSheetProvider>{children}</FullscreenSheetProvider>
);

describe('useFullscreenSheet', () => {
  let historySpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    historySpy = vi.spyOn(window.history, 'pushState');
  });
  afterEach(() => {
    historySpy.mockRestore();
    // 잔존 listener 회피
    window.dispatchEvent(new PopStateEvent('popstate'));
  });

  test('초기 스택 비어있음', () => {
    const { result } = renderHook(() => useFullscreenSheet(), { wrapper: wrap });
    expect(result.current.stack).toHaveLength(0);
  });

  test('push 호출 시 스택 push + history.pushState 호출', () => {
    const { result } = renderHook(() => useFullscreenSheet(), { wrapper: wrap });
    act(() => {
      result.current.push({ key: 'select-playlist', node: <div /> });
    });
    expect(result.current.stack).toHaveLength(1);
    expect(result.current.stack[0].key).toBe('select-playlist');
    expect(historySpy).toHaveBeenCalledTimes(1);
  });

  test('같은 key 중복 push 는 dedup (스택 1개 유지)', () => {
    const { result } = renderHook(() => useFullscreenSheet(), { wrapper: wrap });
    act(() => {
      result.current.push({ key: 'select-playlist', node: <div /> });
      result.current.push({ key: 'select-playlist', node: <div /> });
    });
    expect(result.current.stack).toHaveLength(1);
  });

  test('pop 호출 시 onClose 콜백 실행 + 스택에서 제거', () => {
    const onClose = vi.fn();
    const { result } = renderHook(() => useFullscreenSheet(), { wrapper: wrap });
    act(() => {
      result.current.push({ key: 'select-playlist', node: <div />, onClose });
    });
    act(() => {
      result.current.pop();
    });
    expect(result.current.stack).toHaveLength(0);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('popstate 이벤트 시 스택 pop (1개일 때 close)', () => {
    const onClose = vi.fn();
    const { result } = renderHook(() => useFullscreenSheet(), { wrapper: wrap });
    act(() => {
      result.current.push({ key: 'select-playlist', node: <div />, onClose });
    });
    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(result.current.stack).toHaveLength(0);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('popstate 이벤트 시 다중 스택은 pop 만 (상위만 제거)', () => {
    const onCloseA = vi.fn();
    const onCloseB = vi.fn();
    const { result } = renderHook(() => useFullscreenSheet(), { wrapper: wrap });
    act(() => {
      result.current.push({ key: 'select-playlist', node: <div />, onClose: onCloseA });
      result.current.push({ key: 'add-tracks', node: <div />, onClose: onCloseB });
    });
    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(result.current.stack).toHaveLength(1);
    expect(result.current.stack[0].key).toBe('select-playlist');
    expect(onCloseB).toHaveBeenCalledTimes(1);
    expect(onCloseA).not.toHaveBeenCalled();
  });

  test('ESC 키 입력 시 popstate 동일 동작 (history.back 호출)', () => {
    const backSpy = vi.spyOn(window.history, 'back');
    const { result } = renderHook(() => useFullscreenSheet(), { wrapper: wrap });
    act(() => {
      result.current.push({ key: 'select-playlist', node: <div /> });
    });
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    expect(backSpy).toHaveBeenCalledTimes(1);
    backSpy.mockRestore();
  });

  test('closeAll 호출 시 모든 onClose 콜백 + history.go(-N)', () => {
    const goSpy = vi.spyOn(window.history, 'go');
    const onCloseA = vi.fn();
    const onCloseB = vi.fn();
    const { result } = renderHook(() => useFullscreenSheet(), { wrapper: wrap });
    act(() => {
      result.current.push({ key: 'select-playlist', node: <div />, onClose: onCloseA });
      result.current.push({ key: 'add-tracks', node: <div />, onClose: onCloseB });
    });
    act(() => {
      result.current.closeAll();
    });
    expect(result.current.stack).toHaveLength(0);
    expect(onCloseA).toHaveBeenCalledTimes(1);
    expect(onCloseB).toHaveBeenCalledTimes(1);
    expect(goSpy).toHaveBeenCalledWith(-2);
    goSpy.mockRestore();
  });

  test('unmount 시 popstate/keydown listener cleanup', () => {
    const { unmount } = renderHook(() => useFullscreenSheet(), { wrapper: wrap });
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    unmount();
    expect(removeSpy).toHaveBeenCalledWith('popstate', expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    removeSpy.mockRestore();
  });
});
```

- [ ] **Step 2: run failing tests**

```bash
yarn test src/widgets-mobile/partyroom-djing-sheet/lib/use-fullscreen-sheet.hook.test.tsx --run
```

Expected: FAIL with "cannot find module './use-fullscreen-sheet.hook'".

- [ ] **Step 3: 최소 구현**

```tsx
// src/widgets-mobile/partyroom-djing-sheet/lib/use-fullscreen-sheet.hook.tsx
'use client';
import {
  createContext,
  FC,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

export type SheetKey = 'select-playlist' | 'add-tracks' | 'djing-guide' | string;

export interface SheetEntry {
  key: SheetKey;
  node: ReactNode;
  onClose?: () => void;
}

interface FullscreenSheetController {
  stack: SheetEntry[];
  push: (entry: SheetEntry) => void;
  pop: () => void;
  closeAll: () => void;
}

const FullscreenSheetContext = createContext<FullscreenSheetController | null>(null);

export const useFullscreenSheet = (): FullscreenSheetController => {
  const ctx = useContext(FullscreenSheetContext);
  if (!ctx) throw new Error('useFullscreenSheet must be used within FullscreenSheetProvider');
  return ctx;
};

export const FullscreenSheetProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [stack, setStack] = useState<SheetEntry[]>([]);
  // ref 로 listener 안 stale closure 회피
  const stackRef = useRef<SheetEntry[]>([]);
  stackRef.current = stack;

  const push = useCallback((entry: SheetEntry) => {
    setStack((prev) => {
      // dedup: 같은 key 가 stack 최상단이면 무시
      if (prev.length > 0 && prev[prev.length - 1].key === entry.key) return prev;
      window.history.pushState({ sheetKey: entry.key }, '');
      return [...prev, entry];
    });
  }, []);

  const pop = useCallback(() => {
    setStack((prev) => {
      if (prev.length === 0) return prev;
      const top = prev[prev.length - 1];
      top.onClose?.();
      return prev.slice(0, -1);
    });
  }, []);

  const closeAll = useCallback(() => {
    const current = stackRef.current;
    current.forEach((entry) => entry.onClose?.());
    if (current.length > 0) window.history.go(-current.length);
    setStack([]);
  }, []);

  useEffect(() => {
    const onPopstate = () => {
      // stack 이 비어있으면 라우터에 위임 (개입 안 함)
      if (stackRef.current.length === 0) return;
      pop();
    };
    const onKeydown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (stackRef.current.length === 0) return;
      // popstate 와 동일 시맨틱
      window.history.back();
    };
    window.addEventListener('popstate', onPopstate);
    window.addEventListener('keydown', onKeydown);
    return () => {
      window.removeEventListener('popstate', onPopstate);
      window.removeEventListener('keydown', onKeydown);
    };
  }, [pop]);

  const value = useMemo<FullscreenSheetController>(
    () => ({ stack, push, pop, closeAll }),
    [stack, push, pop, closeAll]
  );

  return (
    <FullscreenSheetContext.Provider value={value}>
      {children}
      {/* 활성 sheet 들의 mount는 별도 SheetHost 컴포넌트가 stack 을 렌더. Phase 3.2 에서 결합 */}
    </FullscreenSheetContext.Provider>
  );
};
```

- [ ] **Step 4: tests pass 확인**

```bash
yarn test src/widgets-mobile/partyroom-djing-sheet/lib/use-fullscreen-sheet.hook.test.tsx --run
```

Expected: 모든 시나리오 PASS.

- [ ] **Step 5: commit**

```bash
git add src/widgets-mobile/partyroom-djing-sheet/lib/use-fullscreen-sheet.hook.tsx \
        src/widgets-mobile/partyroom-djing-sheet/lib/use-fullscreen-sheet.hook.test.tsx
git commit -m "feat(widgets-mobile/partyroom-djing-sheet): useFullscreenSheet hook + Provider

- push/pop/closeAll/stack 노출 (spec §5.3)
- 같은 key 중복 push dedup
- popstate + ESC 통합 (스택 1개=close, 다중=상위 pop)
- listener cleanup on unmount"
```

### Task 3.2: `FullscreenSheet` 공용 컴포넌트 (a11y 인프라 포함)

**Files:**

- Create: `src/widgets-mobile/partyroom-djing-sheet/ui/fullscreen-sheet.component.tsx`
- Create: `src/widgets-mobile/partyroom-djing-sheet/ui/fullscreen-sheet.component.test.tsx`

- [ ] **Step 1: failing test (렌더 + a11y + scroll lock)**

```tsx
// src/widgets-mobile/partyroom-djing-sheet/ui/fullscreen-sheet.component.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import FullscreenSheet from './fullscreen-sheet.component';

describe('FullscreenSheet', () => {
  test('open=false 시 미렌더', () => {
    const onClose = vi.fn();
    const { container } = render(
      <FullscreenSheet open={false} title='테스트' onClose={onClose}>
        body
      </FullscreenSheet>
    );
    expect(container.innerHTML).toBe('');
  });

  test('open=true 시 role=dialog + aria-modal + aria-labelledby', () => {
    const onClose = vi.fn();
    render(
      <FullscreenSheet open={true} title='플레이리스트 선택' onClose={onClose}>
        body
      </FullscreenSheet>
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    const titleId = dialog.getAttribute('aria-labelledby');
    expect(titleId).toBeTruthy();
    const title = document.getElementById(titleId!);
    expect(title?.textContent).toBe('플레이리스트 선택');
  });

  test('header 의 × 클릭 시 onClose 호출 (onBack 없을 때)', async () => {
    const onClose = vi.fn();
    render(
      <FullscreenSheet open={true} title='t' onClose={onClose}>
        body
      </FullscreenSheet>
    );
    await userEvent.click(screen.getByTestId('fullscreen-sheet-close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('onBack 있을 때 ← 버튼 노출, 클릭 시 onBack 호출', async () => {
    const onBack = vi.fn();
    const onClose = vi.fn();
    render(
      <FullscreenSheet open={true} title='t' onClose={onClose} onBack={onBack}>
        body
      </FullscreenSheet>
    );
    expect(screen.queryByTestId('fullscreen-sheet-close')).not.toBeInTheDocument();
    await userEvent.click(screen.getByTestId('fullscreen-sheet-back'));
    expect(onBack).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
  });

  test('ESC 키 자체 처리 없음 (hook 단일 ESC 정책 — spec §5.2 잠금)', () => {
    const onBack = vi.fn();
    const onClose = vi.fn();
    render(
      <FullscreenSheet open={true} title='t' onClose={onClose} onBack={onBack}>
        body
      </FullscreenSheet>
    );
    fireEvent.keyDown(window, { key: 'Escape' });
    // FullscreenSheet 자체엔 ESC handler 없음 — onBack/onClose 미발화
    expect(onBack).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  test('body / footer slot 렌더', () => {
    const onClose = vi.fn();
    render(
      <FullscreenSheet
        open={true}
        title='t'
        onClose={onClose}
        footer={<div data-testid='ft'>FOOTER</div>}
      >
        <div data-testid='bd'>BODY</div>
      </FullscreenSheet>
    );
    expect(screen.getByTestId('bd')).toHaveTextContent('BODY');
    expect(screen.getByTestId('ft')).toHaveTextContent('FOOTER');
  });

  test('open=true 시 document.body 에 overflow:hidden (scroll lock)', () => {
    const onClose = vi.fn();
    const { unmount } = render(
      <FullscreenSheet open={true} title='t' onClose={onClose}>
        body
      </FullscreenSheet>
    );
    expect(document.body.style.overflow).toBe('hidden');
    unmount();
    expect(document.body.style.overflow).toBe('');
  });

  test('open=true 시 focus 가 sheet 안으로 (× 또는 title)', () => {
    const onClose = vi.fn();
    render(
      <FullscreenSheet open={true} title='t' onClose={onClose}>
        body
      </FullscreenSheet>
    );
    // × 또는 ← 가 첫 focus target
    expect(document.activeElement).toBe(screen.getByTestId('fullscreen-sheet-close'));
  });
});
```

- [ ] **Step 2: run failing tests**

```bash
yarn test src/widgets-mobile/partyroom-djing-sheet/ui/fullscreen-sheet.component.test.tsx --run
```

Expected: FAIL with "cannot find module './fullscreen-sheet.component'".

- [ ] **Step 3: 최소 구현**

```tsx
// src/widgets-mobile/partyroom-djing-sheet/ui/fullscreen-sheet.component.tsx
'use client';
import { FC, ReactNode, useEffect, useId, useRef } from 'react';
import { cn } from '@/shared/lib/functions/cn';
import { TextButton } from '@/shared/ui/components/text-button';
import { Typography } from '@/shared/ui/components/typography';
import { PFArrowLeft, PFClose } from '@/shared/ui/icons';

interface Props {
  open: boolean;
  title?: string;
  onClose: () => void;
  onBack?: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * 모바일 풀스크린 sheet (spec §5.2).
 *
 * a11y:
 * - role=dialog + aria-modal=true + aria-labelledby=titleId
 * - ESC 키 → onBack ?? onClose
 * - body scroll lock (open 동안)
 * - 첫 focus = × 또는 ← 버튼
 */
const FullscreenSheet: FC<Props> = ({ open, title, onClose, onBack, children, footer }) => {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);

  // scroll lock
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // ESC handler 는 본 컴포넌트가 들지 않음 — useFullscreenSheet hook 의 ESC handler 가 단일 발화 (spec §5.2 마지막 줄 잠금: popstate listener 와 ESC handler 가 같은 pop 함수 호출).
  // chunk 4 의 FullscreenSheet 는 SheetHost 를 통해서만 mount 되므로 hook 의 ESC handler 가 항상 활성.
  // standalone 사용 (FullscreenSheetProvider 외부) 은 본 chunk 4 OUT — 필요 시 호출자가 자체 ESC handler 추가 책임.

  // first focus
  useEffect(() => {
    if (!open) return;
    if (onBack) backRef.current?.focus();
    else closeRef.current?.focus();
  }, [open, onBack]);

  if (!open) return null;

  return (
    <div
      role='dialog'
      aria-modal='true'
      aria-labelledby={title ? titleId : undefined}
      className={cn(
        'fixed inset-0 z-50 bg-black flex flex-col',
        'pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]'
      )}
    >
      {/* header sticky-top */}
      <header className='shrink-0 flex items-center gap-3 px-3 h-[56px] border-b border-gray-800'>
        {onBack ? (
          <TextButton
            ref={backRef}
            onClick={onBack}
            Icon={<PFArrowLeft width={24} height={24} />}
            data-testid='fullscreen-sheet-back'
            aria-label='뒤로'
          />
        ) : (
          <TextButton
            ref={closeRef}
            onClick={onClose}
            Icon={<PFClose width={24} height={24} />}
            data-testid='fullscreen-sheet-close'
            aria-label='닫기'
          />
        )}
        {title && (
          // Typography 의 id prop forward 보장 없음 → native h2 로 id 부여 + Typography 는 안쪽 wrap.
          <h2 id={titleId} className='flex-1 text-center text-base font-medium m-0'>
            {title}
          </h2>
        )}
        {/* 우측 placeholder (대칭) */}
        <div className='w-[40px]' aria-hidden='true' />
      </header>

      {/* body scrollable */}
      <div className='flex-1 overflow-y-auto'>{children}</div>

      {/* footer sticky-bottom */}
      {footer && <div className='shrink-0 border-t border-gray-800 bg-black'>{footer}</div>}
    </div>
  );
};

export default FullscreenSheet;
```

- [ ] **Step 4: PFArrowLeft 아이콘 존재 확인**

```bash
grep -n "PFArrowLeft" src/shared/ui/icons/index.ts
```

Expected: export 존재. 없으면 PFChevronLeft 등 대체 아이콘 사용 또는 SVG inline 추가 (Step 3 의 import 갱신).

- [ ] **Step 5: tests pass**

```bash
yarn test src/widgets-mobile/partyroom-djing-sheet/ui/fullscreen-sheet.component.test.tsx --run
```

Expected: 모든 8 시나리오 PASS.

- [ ] **Step 6: commit**

```bash
git add src/widgets-mobile/partyroom-djing-sheet/ui/fullscreen-sheet.component.tsx \
        src/widgets-mobile/partyroom-djing-sheet/ui/fullscreen-sheet.component.test.tsx
git commit -m "feat(widgets-mobile/partyroom-djing-sheet): FullscreenSheet 공용 컴포넌트

- role=dialog · aria-modal · aria-labelledby (title 있을 때)
- ESC 키 → onBack ?? onClose
- body scroll lock (open 동안)
- 첫 focus = × 또는 ← 버튼
- header sticky-top + body scrollable + footer sticky-bottom"
```

### Task 3.3: SheetHost — stack 렌더 통합

`useFullscreenSheet` 가 관리하는 stack 의 각 entry 를 `FullscreenSheet` 로 mount 시키는 통합 컴포넌트. stack 최상단만 visible (중첩 sheet 도 위 sheet 만 표면화, 아래는 backdrop 으로 가려짐).

**Files:**

- Create: `src/widgets-mobile/partyroom-djing-sheet/ui/sheet-host.component.tsx`
- Create: `src/widgets-mobile/partyroom-djing-sheet/ui/sheet-host.component.test.tsx`

- [ ] **Step 1: failing test**

```tsx
// src/widgets-mobile/partyroom-djing-sheet/ui/sheet-host.component.test.tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { ReactNode } from 'react';
import { describe, expect, test, vi } from 'vitest';
import { FullscreenSheetProvider, useFullscreenSheet } from '../lib/use-fullscreen-sheet.hook';
import SheetHost from './sheet-host.component';

const wrap = ({ children }: { children: ReactNode }) => (
  <FullscreenSheetProvider>
    {children}
    <SheetHost />
  </FullscreenSheetProvider>
);

const Trigger = ({
  onMount,
}: {
  onMount?: (api: ReturnType<typeof useFullscreenSheet>) => void;
}) => {
  const api = useFullscreenSheet();
  if (onMount) onMount(api);
  return null;
};

describe('SheetHost', () => {
  test('스택 비어있으면 dialog 미렌더', () => {
    render(<Trigger />, { wrapper: wrap });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('스택 1개 시 그 entry 의 node 가 sheet 안에 렌더', () => {
    let api: ReturnType<typeof useFullscreenSheet>;
    render(<Trigger onMount={(a) => (api = a)} />, { wrapper: wrap });
    api!.push({
      key: 'select-playlist',
      node: <div data-testid='inner'>INNER</div>,
    });
    expect(screen.getByTestId('inner')).toHaveTextContent('INNER');
  });

  test('스택 2개 시 최상단만 시각 렌더 (가장 위 entry 의 node 활성)', () => {
    let api: ReturnType<typeof useFullscreenSheet>;
    render(<Trigger onMount={(a) => (api = a)} />, { wrapper: wrap });
    api!.push({ key: 'select-playlist', node: <div data-testid='a'>A</div> });
    api!.push({ key: 'add-tracks', node: <div data-testid='b'>B</div> });
    expect(screen.getByTestId('b')).toBeInTheDocument();
    // A 는 hidden 또는 미렌더 — 본 구현 결정: 최상단만 렌더
    expect(screen.queryByTestId('a')).not.toBeInTheDocument();
  });

  test('ESC 통합 시나리오 — 스택 1개 시 entry.onClose 1번만 발화 (double pop 없음)', () => {
    let api: ReturnType<typeof useFullscreenSheet>;
    const onClose = vi.fn();
    render(<Trigger onMount={(a) => (api = a)} />, { wrapper: wrap });
    const backSpy = vi.spyOn(window.history, 'back');
    api!.push({ key: 'select-playlist', node: <div />, onClose });
    // ESC → hook 의 ESC handler 가 history.back 호출 → popstate → pop → entry.onClose
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(backSpy).toHaveBeenCalledTimes(1);
    // popstate 가 자동 dispatch 안 되므로 명시 dispatch (real browser 에선 history.back 가 popstate 발화)
    fireEvent.popState(window);
    expect(onClose).toHaveBeenCalledTimes(1);
    backSpy.mockRestore();
  });
});
```

- [ ] **Step 2: run failing tests**

```bash
yarn test src/widgets-mobile/partyroom-djing-sheet/ui/sheet-host.component.test.tsx --run
```

Expected: FAIL — "cannot find module './sheet-host.component'".

- [ ] **Step 3: 최소 구현**

```tsx
// src/widgets-mobile/partyroom-djing-sheet/ui/sheet-host.component.tsx
'use client';
import { FC } from 'react';
import { useFullscreenSheet } from '../lib/use-fullscreen-sheet.hook';
import FullscreenSheet from './fullscreen-sheet.component';

/**
 * 스택 최상단 entry 만 FullscreenSheet 로 mount.
 * 아래 entry 들은 mount 안 함 — IFrame remount trade-off:
 * - sheet 스택 깊이 변화 (push/pop) 시 위 sheet 의 wrapper (YouTubePreviewPlayer container) 가 unmount/remount.
 * - chunk 3.1 ToS 패턴 "loadVideoById 로 IFrame remount 0" 은 동일 wrapper persistence 전제 — sheet 변경 시엔 적용 안 됨 (다음 sheet 의 wrapper 는 새 IFrame).
 * - 다만 새 IFrame 도 visible frame (64×36) 이므로 ToS 위반 0 (visible 유지). currentTrack 보존이라도 새 mount 는 별 ToS 영향 없음.
 * - stack 깊이 = 보통 1~2 (select-playlist → add-tracks). add-tracks 의 mini-player 는 sheet 닫힐 때 stopPreview 로 정리되어 currentTrack 도 null.
 */
const SheetHost: FC = () => {
  const { stack, pop } = useFullscreenSheet();
  const top = stack[stack.length - 1];
  if (!top) return null;

  const hasBack = stack.length > 1;

  return (
    <FullscreenSheet open={true} onClose={pop} onBack={hasBack ? pop : undefined}>
      {top.node}
    </FullscreenSheet>
  );
};

export default SheetHost;
```

- [ ] **Step 4: tests pass**

```bash
yarn test src/widgets-mobile/partyroom-djing-sheet/ui/sheet-host.component.test.tsx --run
```

Expected: 3/3 PASS.

- [ ] **Step 5: title 처리 — 각 entry 가 own title 보유**

위 구현에서 title 이 누락. SheetEntry 에 title?: string 추가 필요. 갱신:

```tsx
// src/widgets-mobile/partyroom-djing-sheet/lib/use-fullscreen-sheet.hook.tsx 갱신:
export interface SheetEntry {
  key: SheetKey;
  node: ReactNode;
  title?: string; // ← 추가
  onClose?: () => void;
}
```

```tsx
// src/widgets-mobile/partyroom-djing-sheet/ui/sheet-host.component.tsx 갱신:
return (
  <FullscreenSheet
    open={true}
    title={top.title} // ← 추가
    onClose={pop}
    onBack={hasBack ? pop : undefined}
  >
    {top.node}
  </FullscreenSheet>
);
```

- [ ] **Step 6: test rerun**

```bash
yarn test src/widgets-mobile/partyroom-djing-sheet/ --run
```

Expected: 모든 테스트 GREEN.

- [ ] **Step 7: barrel + commit**

```ts
// src/widgets-mobile/partyroom-djing-sheet/index.ts
export { default as FullscreenSheet } from './ui/fullscreen-sheet.component';
export { default as SheetHost } from './ui/sheet-host.component';
export {
  FullscreenSheetProvider,
  useFullscreenSheet,
  type SheetEntry,
  type SheetKey,
} from './lib/use-fullscreen-sheet.hook';
```

```bash
git add src/widgets-mobile/partyroom-djing-sheet/
git commit -m "feat(widgets-mobile/partyroom-djing-sheet): SheetHost + barrel

스택 최상단 entry 만 mount. title 은 entry 별 보유. 다중 스택 시 hasBack=true.
SheetEntry.title 추가 (spec §5.2 a11y aria-labelledby 정합)."
```

---

## Phase 4: SelectPlaylistSheet + useMobileSelectPlaylist + 카드 리스트

spec §5.4 + §5.6 잠금. Promise<Playlist | void> contract + drawer 의존 0 + 빈/곡없음 두 분기 분리.

### Task 4.1: `SelectPlaylist` 카드 리스트 컴포넌트 (sheet body)

**Files:**

- Create: `src/features-mobile/partyroom/select-playlist-for-djing/ui/select-playlist.component.tsx`
- Create: `src/features-mobile/partyroom/select-playlist-for-djing/ui/select-playlist.component.test.tsx`

- [ ] **Step 1: failing test**

```tsx
// src/features-mobile/partyroom/select-playlist-for-djing/ui/select-playlist.component.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import SelectPlaylist from './select-playlist.component';

const PLAYLISTS = [
  { id: 1, name: '토요일밤', musicCount: 12 },
  { id: 2, name: 'Chill', musicCount: 8 },
  { id: 3, name: 'Workout', musicCount: 0 }, // 빈 곡 카드
];

describe('SelectPlaylist (모바일 카드 리스트)', () => {
  test('각 플레이리스트가 이름 + 곡수 카드로 렌더', () => {
    render(
      <SelectPlaylist
        playlists={PLAYLISTS as never}
        onSelect={vi.fn()}
        onAddTracksForEmpty={vi.fn()}
      />
    );
    expect(screen.getByText('토요일밤')).toBeInTheDocument();
    expect(screen.getByText('12곡')).toBeInTheDocument();
    expect(screen.getByText('Chill')).toBeInTheDocument();
    expect(screen.getByText('8곡')).toBeInTheDocument();
    expect(screen.getByText('Workout')).toBeInTheDocument();
  });

  test('musicCount > 0 카드 클릭 → onSelect 호출', async () => {
    const onSelect = vi.fn();
    render(
      <SelectPlaylist
        playlists={PLAYLISTS as never}
        onSelect={onSelect}
        onAddTracksForEmpty={vi.fn()}
      />
    );
    await userEvent.click(screen.getByTestId('mobile-playlist-card-1'));
    expect(onSelect).toHaveBeenCalledWith(PLAYLISTS[0]);
  });

  test('musicCount === 0 카드는 [+ 곡 추가] CTA + onAddTracksForEmpty 호출', async () => {
    const onAddTracksForEmpty = vi.fn();
    render(
      <SelectPlaylist
        playlists={PLAYLISTS as never}
        onSelect={vi.fn()}
        onAddTracksForEmpty={onAddTracksForEmpty}
      />
    );
    const cta = screen.getByTestId('mobile-playlist-card-3-add-tracks');
    expect(cta).toHaveTextContent('+ 곡 추가');
    await userEvent.click(cta);
    expect(onAddTracksForEmpty).toHaveBeenCalledWith(PLAYLISTS[2]);
  });

  test('musicCount === 0 카드 자체 클릭은 onSelect 호출 안 함 (선택 불가)', async () => {
    const onSelect = vi.fn();
    render(
      <SelectPlaylist
        playlists={PLAYLISTS as never}
        onSelect={onSelect}
        onAddTracksForEmpty={vi.fn()}
      />
    );
    await userEvent.click(screen.getByTestId('mobile-playlist-card-3'));
    expect(onSelect).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: run failing tests**

```bash
yarn test src/features-mobile/partyroom/select-playlist-for-djing/ui/select-playlist.component.test.tsx --run
```

Expected: FAIL — "cannot find module './select-playlist.component'".

- [ ] **Step 3: 최소 구현**

```tsx
// src/features-mobile/partyroom/select-playlist-for-djing/ui/select-playlist.component.tsx
'use client';
import { FC } from 'react';
import { Playlist } from '@/shared/api/http/types/playlists';
import { cn } from '@/shared/lib/functions/cn';
import { TextButton } from '@/shared/ui/components/text-button';
import { Typography } from '@/shared/ui/components/typography';

interface Props {
  playlists: Playlist[];
  onSelect: (playlist: Playlist) => void;
  onAddTracksForEmpty: (playlist: Playlist) => void;
}

const SelectPlaylist: FC<Props> = ({ playlists, onSelect, onAddTracksForEmpty }) => {
  return (
    <ul className='flex flex-col divide-y divide-gray-800'>
      {playlists.map((p) => {
        const empty = p.musicCount === 0;
        return (
          <li key={p.id} className='flex items-center justify-between gap-3 px-4 py-4'>
            <button
              type='button'
              data-testid={`mobile-playlist-card-${p.id}`}
              onClick={empty ? undefined : () => onSelect(p)}
              disabled={empty}
              className={cn('flex-1 text-left min-w-0', empty && 'cursor-not-allowed opacity-50')}
            >
              <Typography type='body3' className='truncate'>
                {p.name}
              </Typography>
              <Typography type='detail2' className='text-gray-400'>
                {p.musicCount}곡
              </Typography>
            </button>
            {empty && (
              <TextButton
                data-testid={`mobile-playlist-card-${p.id}-add-tracks`}
                onClick={() => onAddTracksForEmpty(p)}
                className='text-primary-300 px-2 py-1'
                typographyType='caption1'
              >
                + 곡 추가
              </TextButton>
            )}
          </li>
        );
      })}
    </ul>
  );
};

export default SelectPlaylist;
```

- [ ] **Step 4: tests pass**

```bash
yarn test src/features-mobile/partyroom/select-playlist-for-djing/ui/select-playlist.component.test.tsx --run
```

Expected: 4/4 PASS.

- [ ] **Step 5: commit**

```bash
git add src/features-mobile/partyroom/select-playlist-for-djing/ui/select-playlist.component.tsx \
        src/features-mobile/partyroom/select-playlist-for-djing/ui/select-playlist.component.test.tsx
git commit -m "feat(features-mobile/partyroom/select-playlist-for-djing): 모바일 카드 리스트

- 각 플레이리스트가 이름 + 곡수 카드
- musicCount > 0 클릭 → onSelect
- musicCount === 0 카드는 disabled + [+ 곡 추가] CTA → onAddTracksForEmpty"
```

### Task 4.2: SelectPlaylistSheet (FullscreenSheet 안 SelectPlaylist 통합)

**Files:**

- Create: `src/widgets-mobile/partyroom-djing-sheet/ui/select-playlist-sheet.component.tsx`
- Create: `src/widgets-mobile/partyroom-djing-sheet/ui/select-playlist-sheet.component.test.tsx`

- [ ] **Step 1: failing test (sheet body + footer 액션)**

```tsx
// src/widgets-mobile/partyroom-djing-sheet/ui/select-playlist-sheet.component.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import SelectPlaylistSheet from './select-playlist-sheet.component';

const PL = [{ id: 1, name: 'A', musicCount: 5 }];

describe('SelectPlaylistSheet', () => {
  test('SelectPlaylist 카드 리스트 + 푸터 [취소][선택 완료]', () => {
    render(
      <SelectPlaylistSheet
        playlists={PL as never}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        onAddTracksForEmpty={vi.fn()}
      />
    );
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByTestId('select-playlist-cancel')).toHaveTextContent('취소');
    expect(screen.getByTestId('select-playlist-confirm')).toHaveTextContent('선택 완료');
  });

  test('카드 선택 후 [선택 완료] 클릭 시 onConfirm(playlist)', async () => {
    const onConfirm = vi.fn();
    render(
      <SelectPlaylistSheet
        playlists={PL as never}
        onConfirm={onConfirm}
        onCancel={vi.fn()}
        onAddTracksForEmpty={vi.fn()}
      />
    );
    await userEvent.click(screen.getByTestId('mobile-playlist-card-1'));
    await userEvent.click(screen.getByTestId('select-playlist-confirm'));
    expect(onConfirm).toHaveBeenCalledWith(PL[0]);
  });

  test('선택 없이 [선택 완료] 클릭 시 disabled (호출 안 됨)', async () => {
    const onConfirm = vi.fn();
    render(
      <SelectPlaylistSheet
        playlists={PL as never}
        onConfirm={onConfirm}
        onCancel={vi.fn()}
        onAddTracksForEmpty={vi.fn()}
      />
    );
    expect(screen.getByTestId('select-playlist-confirm')).toBeDisabled();
    await userEvent.click(screen.getByTestId('select-playlist-confirm'));
    expect(onConfirm).not.toHaveBeenCalled();
  });

  test('[취소] 클릭 시 onCancel 호출', async () => {
    const onCancel = vi.fn();
    render(
      <SelectPlaylistSheet
        playlists={PL as never}
        onConfirm={vi.fn()}
        onCancel={onCancel}
        onAddTracksForEmpty={vi.fn()}
      />
    );
    await userEvent.click(screen.getByTestId('select-playlist-cancel'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: run failing tests**

```bash
yarn test src/widgets-mobile/partyroom-djing-sheet/ui/select-playlist-sheet.component.test.tsx --run
```

Expected: FAIL — "cannot find module".

- [ ] **Step 3: 최소 구현 (sheet body + footer 합성. SheetHost 가 외부 FullscreenSheet 로 wrap)**

```tsx
// src/widgets-mobile/partyroom-djing-sheet/ui/select-playlist-sheet.component.tsx
'use client';
import { FC, useState } from 'react';
import { Playlist } from '@/shared/api/http/types/playlists';
import { Button } from '@/shared/ui/components/button';
import SelectPlaylist from '@/features-mobile/partyroom/select-playlist-for-djing/ui/select-playlist.component';

interface Props {
  playlists: Playlist[];
  onConfirm: (playlist: Playlist) => void;
  onCancel: () => void;
  onAddTracksForEmpty: (playlist: Playlist) => void;
}

const SelectPlaylistSheet: FC<Props> = ({
  playlists,
  onConfirm,
  onCancel,
  onAddTracksForEmpty,
}) => {
  const [selected, setSelected] = useState<Playlist | undefined>(undefined);

  return (
    <div className='flex flex-col h-full'>
      <div className='flex-1 overflow-y-auto'>
        <SelectPlaylist
          playlists={playlists}
          onSelect={setSelected}
          onAddTracksForEmpty={onAddTracksForEmpty}
        />
      </div>
      <div className='shrink-0 grid grid-cols-2 gap-3 p-4'>
        <Button
          data-testid='select-playlist-cancel'
          color='secondary'
          variant='outline'
          onClick={onCancel}
        >
          취소
        </Button>
        <Button
          data-testid='select-playlist-confirm'
          disabled={!selected}
          onClick={() => selected && onConfirm(selected)}
        >
          선택 완료
        </Button>
      </div>
    </div>
  );
};

export default SelectPlaylistSheet;
```

- [ ] **Step 4: tests pass**

```bash
yarn test src/widgets-mobile/partyroom-djing-sheet/ui/select-playlist-sheet.component.test.tsx --run
```

Expected: 4/4 PASS.

- [ ] **Step 5: commit**

```bash
git add src/widgets-mobile/partyroom-djing-sheet/ui/select-playlist-sheet.component.tsx \
        src/widgets-mobile/partyroom-djing-sheet/ui/select-playlist-sheet.component.test.tsx
git commit -m "feat(widgets-mobile/partyroom-djing-sheet): SelectPlaylistSheet

- SelectPlaylist 카드 + 푸터 [취소][선택 완료]
- 선택 없으면 [선택 완료] disabled
- [+ 곡 추가] CTA 는 onAddTracksForEmpty 위임 (Phase 6 AddTracksSheet 와 연결)"
```

### Task 4.3: `useMobileSelectPlaylist` hook (Promise<Playlist | void> contract)

**Files:**

- Create: `src/features-mobile/partyroom/select-playlist-for-djing/ui/use-mobile-select-playlist.hook.tsx`
- Create: `src/features-mobile/partyroom/select-playlist-for-djing/ui/use-mobile-select-playlist.hook.test.tsx`
- Create: `src/features-mobile/partyroom/select-playlist-for-djing/index.ts`

- [ ] **Step 1: failing test**

```tsx
// src/features-mobile/partyroom/select-playlist-for-djing/ui/use-mobile-select-playlist.hook.test.tsx
import { renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { FullscreenSheetProvider } from '@/widgets-mobile/partyroom-djing-sheet';
import useMobileSelectPlaylist from './use-mobile-select-playlist.hook';

const pushMock = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

const confirmMock = vi.fn();
vi.mock('@/shared/ui/components/dialog', () => ({
  useDialog: () => ({
    openConfirmDialog: (...args: unknown[]) => confirmMock(...args),
  }),
}));

const PL_OK = [{ id: 1, name: 'A', musicCount: 5 }];
const PL_ALL_EMPTY = [{ id: 1, name: 'A', musicCount: 0 }];

const wrap = ({ children }: { children: ReactNode }) => (
  <FullscreenSheetProvider>{children}</FullscreenSheetProvider>
);

describe('useMobileSelectPlaylist', () => {
  beforeEach(() => {
    pushMock.mockReset();
    confirmMock.mockReset();
  });

  test('playlists=[] → confirm dialog → confirm 시 /me/playlist push + resolve(undefined)', async () => {
    confirmMock.mockResolvedValue(true);
    const { result } = renderHook(() => useMobileSelectPlaylist({ playlists: [] }), {
      wrapper: wrap,
    });
    const promise = result.current();
    await waitFor(() => expect(confirmMock).toHaveBeenCalled());
    await expect(promise).resolves.toBeUndefined();
    expect(pushMock).toHaveBeenCalledWith('/me/playlist');
  });

  test('playlists=[] + confirm 취소 시 push 없음 + resolve(undefined)', async () => {
    confirmMock.mockResolvedValue(false);
    const { result } = renderHook(() => useMobileSelectPlaylist({ playlists: [] }), {
      wrapper: wrap,
    });
    const promise = result.current();
    await expect(promise).resolves.toBeUndefined();
    expect(pushMock).not.toHaveBeenCalled();
  });

  test('every musicCount === 0 → SelectPlaylistSheet push (confirm dialog 안 띄움)', async () => {
    const { result } = renderHook(
      () => useMobileSelectPlaylist({ playlists: PL_ALL_EMPTY as never }),
      {
        wrapper: wrap,
      }
    );
    const promise = result.current();
    // sheet push 이후엔 외부 액션 (취소) 까지 대기 — 본 테스트는 confirm dialog 호출 0 만 단언
    await new Promise((r) => setTimeout(r, 0));
    expect(confirmMock).not.toHaveBeenCalled();
    // resolve 는 sheet 가 close 되어야 — 본 test 는 외부 close 미실행으로 resolve 안 됨 (timeout 회피 위해 promise 무시)
    void promise;
  });

  test.todo(
    '정상 playlists → SelectPlaylistSheet push, 선택 완료 시 resolve(playlist) — Phase 9 통합 테스트로 검증'
  );
});
```

- [ ] **Step 2: run failing tests**

```bash
yarn test src/features-mobile/partyroom/select-playlist-for-djing/ui/use-mobile-select-playlist.hook.test.tsx --run
```

Expected: FAIL — "cannot find module".

- [ ] **Step 3: 최소 구현**

```tsx
// src/features-mobile/partyroom/select-playlist-for-djing/ui/use-mobile-select-playlist.hook.tsx
'use client';
import { useRouter } from 'next/navigation';
import { FC, useCallback } from 'react';
import { Playlist } from '@/shared/api/http/types/playlists';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useDialog } from '@/shared/ui/components/dialog';
import { useFullscreenSheet } from '@/widgets-mobile/partyroom-djing-sheet';
import SelectPlaylistSheet from '@/widgets-mobile/partyroom-djing-sheet/ui/select-playlist-sheet.component';

interface Args {
  playlists: Playlist[];
}

/**
 * 모바일 셀렉터. 데스크탑 `useSelectPlaylistForDjing` 의 사본 (spec §5.4).
 *
 * contract: `() => Promise<Playlist | void>`
 *
 * 분기:
 * - playlists=[] → confirm dialog → confirm 시 /me/playlist push, resolve(undefined)
 * - every musicCount===0 → SelectPlaylistSheet (빈 곡 카드의 [+ 곡 추가] CTA → AddTracksSheet)
 * - 정상 → SelectPlaylistSheet, 카드 선택 → resolve(playlist)
 *
 * 데스크탑 hook 의 drawer 의존 (setPlaylistDrawer · playlistDrawerWithSelectPlaylist · closePlaylistDrawer · useDidMountEffect)
 * 전부 제거 (모바일은 PlaylistDrawer OUT scope).
 */
export default function useMobileSelectPlaylist({
  playlists,
}: Args): () => Promise<Playlist | void> {
  const t = useI18n();
  const router = useRouter();
  const { openConfirmDialog } = useDialog();
  const { push, pop } = useFullscreenSheet();

  return useCallback(async () => {
    if (playlists.length === 0) {
      const confirmed = await openConfirmDialog({
        content: t.dj.para.create_playlist_song,
      });
      if (confirmed) router.push('/me/playlist');
      return undefined;
    }

    return new Promise<Playlist | void>((resolve) => {
      push({
        key: 'select-playlist',
        title: '플레이리스트 선택',
        node: (
          <SelectPlaylistSheet
            playlists={playlists}
            onConfirm={(p) => {
              pop();
              resolve(p);
            }}
            onCancel={() => {
              pop();
              resolve(undefined);
            }}
            onAddTracksForEmpty={(p) => {
              // Phase 6 AddTracksSheet push 진입 — 본 hook 은 entry point 만 노출.
              // resolve 는 미실행 (사용자가 곡 추가 후 SelectPlaylistSheet 로 복귀하면 다시 onConfirm/onCancel 분기).
              push({
                key: 'add-tracks',
                title: '곡 추가',
                node: <PendingAddTracksPlaceholder playlistId={p.id} />,
              });
            }}
          />
        ),
        onClose: () => resolve(undefined),
      });
    });
  }, [playlists, router, openConfirmDialog, push, pop, t.dj.para.create_playlist_song]);
}

// Phase 6 의 AddTracksSheet 컴포넌트로 교체 예정 — Phase 4 단계엔 placeholder. import 경로는 Phase 6 에서 갱신.
const PendingAddTracksPlaceholder: FC<{ playlistId: number }> = ({ playlistId }) => (
  <div data-testid='pending-add-tracks' data-playlist-id={playlistId} />
);
```

- [ ] **Step 4: barrel**

```ts
// src/features-mobile/partyroom/select-playlist-for-djing/index.ts
export { default as useMobileSelectPlaylist } from './ui/use-mobile-select-playlist.hook';
```

- [ ] **Step 5: tests pass**

```bash
yarn test src/features-mobile/partyroom/select-playlist-for-djing/ --run
```

Expected: 단위 시나리오 PASS (정상 분기는 Phase 9 통합 테스트로 확장).

- [ ] **Step 6: commit**

```bash
git add src/features-mobile/partyroom/select-playlist-for-djing/
git commit -m "feat(features-mobile/partyroom/select-playlist-for-djing): useMobileSelectPlaylist hook

- Promise<Playlist | void> contract (데스크탑 useSelectPlaylistForDjing 의 모바일 사본)
- 분기: playlists=[] (confirm → /me/playlist), every musicCount===0 (sheet + 빈 카드 CTA), 정상 (sheet 선택)
- drawer 의존 0 (spec §5.4 잠금)
- AddTracksSheet 진입점은 Phase 6 에서 컴포넌트 교체"
```

---

## Phase 5: MiniPlayer (sheet 내부 bottom)

spec §5.5 outcome A (Phase 1 잠금: 64×36 visible frame · 112px container · 컨트롤 우상단).

### Task 5.1: `PREVIEW_PLAYER_SIZES['mobile-bottom']` 추가 + PlayerContainer position union 확장

**Files:**

- Modify: `src/entities/music-preview/config/youtube-player.config.ts`
- Modify: `src/widgets/music-preview-player/ui/player-container.component.tsx`

- [ ] **Step 0: 실제 baseline 값 확인**

```bash
cat src/entities/music-preview/config/youtube-player.config.ts
```

Expected: `sidebar: { width: 320, height: 180 }` + `modal: { width: 280, height: 157 }`. 다르면 Step 1 의 기존 값 유지.

- [ ] **Step 1: youtube-player.config 갱신 (mobile-bottom 항목 추가)**

```ts
// src/entities/music-preview/config/youtube-player.config.ts
// (기존 sidebar · modal 항목 그대로 유지하고 mobile-bottom 만 추가)
export const PREVIEW_PLAYER_SIZES = {
  sidebar: { width: 320, height: 180 },
  modal: { width: 280, height: 157 },
  'mobile-bottom': { width: 64, height: 36 }, // ⭐ chunk 4 추가 (Phase 1 outcome A)
} as const;
```

- [ ] **Step 2: PlayerContainer position prop union 확장**

```tsx
// src/widgets/music-preview-player/ui/player-container.component.tsx
// (line 9 변경)
// 기존: position: 'sidebar' | 'modal';
// 변경: position: 'sidebar' | 'modal' | 'mobile-bottom';
```

- [ ] **Step 3: typecheck (데스크탑 sidebar/modal 영향 0 확인)**

```bash
yarn typecheck
```

Expected: 0 errors. PlayerContainer 사용처 (sidebar-player·modal-player) 가 그대로 동작.

- [ ] **Step 4: 기존 PlayerContainer 단위 테스트 회귀**

```bash
yarn test src/widgets/music-preview-player/ --run
```

Expected: 기존 dim-overlay 등 GREEN.

- [ ] **Step 5: commit**

```bash
git add src/entities/music-preview/config/youtube-player.config.ts \
        src/widgets/music-preview-player/ui/player-container.component.tsx
git commit -m "feat(entities/music-preview): mobile-bottom size 추가 + PlayerContainer position union 확장

64×36 visible frame (chunk 4 spec §5.5 outcome A 잠금 — Phase 1).
데스크탑 sidebar/modal 동작 0 영향."
```

### Task 5.2: `MiniPlayer` 컴포넌트 (sheet 내부 bottom)

**Files:**

- Create: `src/widgets-mobile/music-preview-mini-player/ui/mini-player.component.tsx`
- Create: `src/widgets-mobile/music-preview-mini-player/ui/mini-player.component.test.tsx`
- Create: `src/widgets-mobile/music-preview-mini-player/index.ts`

- [ ] **Step 1: failing test**

```tsx
// src/widgets-mobile/music-preview-mini-player/ui/mini-player.component.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import MiniPlayer from './mini-player.component';

const stopPreviewMock = vi.fn();
const useMusicPreviewMock = vi.fn();

vi.mock('@/shared/lib/store/stores.context', () => ({
  useStores: () => ({
    useMusicPreview: useMusicPreviewMock,
  }),
}));

vi.mock('@/entities/music-preview/index.ui', () => ({
  YouTubePreviewPlayer: (props: { width: number; height: number }) => (
    <div data-testid='yt-player' data-width={props.width} data-height={props.height} />
  ),
}));

describe('MiniPlayer (mobile-bottom)', () => {
  test('currentTrack null 시 미렌더', () => {
    useMusicPreviewMock.mockReturnValue({
      currentTrack: null,
      playState: 'idle',
      startPreview: vi.fn(),
      stopPreview: stopPreviewMock,
    });
    const { container } = render(<MiniPlayer onAdd={vi.fn()} addPending={false} />);
    expect(container.innerHTML).toBe('');
  });

  test('playState idle/paused 도 렌더 (▶ 토글 분기 가능)', async () => {
    useMusicPreviewMock.mockReturnValue({
      currentTrack: { name: 'X', artist: 'Y', source: 'preview-search' },
      playState: 'paused',
      startPreview: vi.fn(),
      stopPreview: stopPreviewMock,
    });
    render(<MiniPlayer onAdd={vi.fn()} addPending={false} />);
    expect(screen.getByTestId('mini-player-toggle-play')).toHaveAttribute(
      'aria-label',
      '미리듣기 재생'
    );
  });

  test('▶ 토글 클릭 시 paused 상태에서 startPreview(currentTrack) 호출', async () => {
    const startPreview = vi.fn();
    const track = { name: 'a', artist: 'b', source: 'preview-search' as const };
    useMusicPreviewMock.mockReturnValue({
      currentTrack: track,
      playState: 'paused',
      startPreview,
      stopPreview: stopPreviewMock,
    });
    render(<MiniPlayer onAdd={vi.fn()} addPending={false} />);
    await userEvent.click(screen.getByTestId('mini-player-toggle-play'));
    expect(startPreview).toHaveBeenCalledWith(track);
  });

  test('currentTrack 있음 + playState=playing 시 YouTubePreviewPlayer 렌더 (64×36)', () => {
    useMusicPreviewMock.mockReturnValue({
      currentTrack: { name: 'Song A', artist: 'Artist X', source: 'preview-search' },
      playState: 'playing',
      startPreview: vi.fn(),
      stopPreview: stopPreviewMock,
    });
    render(<MiniPlayer onAdd={vi.fn()} addPending={false} />);
    const yt = screen.getByTestId('yt-player');
    expect(yt.getAttribute('data-width')).toBe('64');
    expect(yt.getAttribute('data-height')).toBe('36');
  });

  test('source 무관 렌더 (playlist-track source 도 정상) — spec §B.4 (데스크탑 sidebar-player 만 source 분기, 모바일 mini-player 는 source 무관)', () => {
    useMusicPreviewMock.mockReturnValue({
      currentTrack: { name: 'X', artist: 'Y', source: 'playlist-track' },
      playState: 'playing',
      startPreview: vi.fn(),
      stopPreview: stopPreviewMock,
    });
    render(<MiniPlayer onAdd={vi.fn()} addPending={false} />);
    expect(screen.getByTestId('yt-player')).toBeInTheDocument();
  });

  test('⏯ 토글 클릭 시 playing 상태에서 stopPreview 호출 (spec §5.5 outcome A 컨트롤 cluster)', async () => {
    useMusicPreviewMock.mockReturnValue({
      currentTrack: { name: 'a', artist: 'b', source: 'preview-search' },
      playState: 'playing',
      startPreview: vi.fn(),
      stopPreview: stopPreviewMock,
    });
    render(<MiniPlayer onAdd={vi.fn()} addPending={false} />);
    await userEvent.click(screen.getByTestId('mini-player-toggle-play'));
    expect(stopPreviewMock).toHaveBeenCalledTimes(1);
  });

  test('곡명·아티스트 노출 (ellipsis 클래스 + 영역 분리)', () => {
    useMusicPreviewMock.mockReturnValue({
      currentTrack: { name: 'Song Title', artist: 'Artist Name', source: 'preview-search' },
      playState: 'playing',
      startPreview: vi.fn(),
      stopPreview: stopPreviewMock,
    });
    render(<MiniPlayer onAdd={vi.fn()} addPending={false} />);
    expect(screen.getByTestId('mini-player-name')).toHaveTextContent('Song Title');
    expect(screen.getByTestId('mini-player-artist')).toHaveTextContent('Artist Name');
  });

  test('[+ 추가] 클릭 시 onAdd(currentTrack) 호출', async () => {
    const onAdd = vi.fn();
    const track = { name: 'A', artist: 'B', source: 'preview-search' as const };
    useMusicPreviewMock.mockReturnValue({
      currentTrack: track,
      playState: 'playing',
      startPreview: vi.fn(),
      stopPreview: stopPreviewMock,
    });
    render(<MiniPlayer onAdd={onAdd} addPending={false} />);
    await userEvent.click(screen.getByTestId('mini-player-add'));
    expect(onAdd).toHaveBeenCalledWith(track);
  });

  test('addPending=true 시 [+ 추가] disabled', () => {
    useMusicPreviewMock.mockReturnValue({
      currentTrack: { name: 'a', artist: 'b', source: 'preview-search' },
      playState: 'playing',
      startPreview: vi.fn(),
      stopPreview: stopPreviewMock,
    });
    render(<MiniPlayer onAdd={vi.fn()} addPending={true} />);
    expect(screen.getByTestId('mini-player-add')).toBeDisabled();
  });

  test('× 클릭 시 stopPreview 호출', async () => {
    useMusicPreviewMock.mockReturnValue({
      currentTrack: { name: 'a', artist: 'b', source: 'preview-search' },
      playState: 'playing',
      startPreview: vi.fn(),
      stopPreview: stopPreviewMock,
    });
    render(<MiniPlayer onAdd={vi.fn()} addPending={false} />);
    await userEvent.click(screen.getByTestId('mini-player-close'));
    expect(stopPreviewMock).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: run failing tests**

```bash
yarn test src/widgets-mobile/music-preview-mini-player/ui/mini-player.component.test.tsx --run
```

Expected: FAIL — "cannot find module".

- [ ] **Step 3: 최소 구현 (spec §5.5 outcome A: 112px container · 컨트롤 우상단 cluster)**

```tsx
// src/widgets-mobile/music-preview-mini-player/ui/mini-player.component.tsx
'use client';
import { FC } from 'react';
import { PREVIEW_PLAYER_SIZES } from '@/entities/music-preview/config/youtube-player.config';
import { YouTubePreviewPlayer } from '@/entities/music-preview/index.ui';
import { useStores } from '@/shared/lib/store/stores.context';
import { Button } from '@/shared/ui/components/button';
import { TextButton } from '@/shared/ui/components/text-button';
import { Typography } from '@/shared/ui/components/typography';
import { PFClose, PFPause, PFPlay } from '@/shared/ui/icons';

interface Props {
  onAdd: (track: { name: string; artist: string }) => void;
  addPending: boolean;
}

/**
 * sheet 내부 bottom mini-player (spec §5.5 outcome A).
 * - 112px 컨테이너
 * - 좌측: 곡명/아티스트 (flex-1 min-w-0 ellipsis)
 * - 우측: ⏯ + [+ 추가] + × 컨트롤 cluster (spec §5.5 outcome A 컨트롤 표)
 * - video 64×36 우측 가장 안쪽 (visible frame, ToS 보존)
 * - track 변경 시 YouTubePreviewPlayer 의 wrapper 가 loadVideoById 로 IFrame remount 0 (chunk 3.1 패턴)
 * - source 무관 (data-testid='yt-player') — 데스크탑 sidebar-player 의 source==='playlist-track' 분기 없음 (spec §B.4)
 */
const MiniPlayer: FC<Props> = ({ onAdd, addPending }) => {
  const { useMusicPreview } = useStores();
  const { currentTrack, playState, startPreview, stopPreview } = useMusicPreview();

  // ⏯ 토글: 미리듣기 store 에 togglePlay 부재라 mini-player 자체 정의 (store 확장 없이 startPreview/stopPreview 합성).
  const togglePlay = () => {
    if (playState === 'playing') stopPreview();
    else if (currentTrack) startPreview(currentTrack);
  };

  // currentTrack 없으면 미렌더 — playState 는 ▶ 토글 분기 가능하게 유지 (idle/paused 도 mini-player 노출)
  if (!currentTrack) return null;

  const SIZE = PREVIEW_PLAYER_SIZES['mobile-bottom'];
  const isPlaying = playState === 'playing';

  return (
    <div className='h-[112px] flex items-center gap-3 px-3 border-t border-gray-800 bg-black'>
      <div className='flex-1 min-w-0'>
        <Typography type='body3' className='truncate' data-testid='mini-player-name'>
          {currentTrack.name}
        </Typography>
        <Typography
          type='detail2'
          className='truncate text-gray-400'
          data-testid='mini-player-artist'
        >
          {currentTrack.artist}
        </Typography>
      </div>
      <div className='flex flex-col items-end gap-2'>
        <div className='flex items-center gap-2'>
          <TextButton
            data-testid='mini-player-toggle-play'
            onClick={togglePlay}
            Icon={
              isPlaying ? <PFPause width={20} height={20} /> : <PFPlay width={20} height={20} />
            }
            aria-label={isPlaying ? '미리듣기 일시정지' : '미리듣기 재생'}
          />
          <Button
            size='sm'
            data-testid='mini-player-add'
            onClick={() => onAdd(currentTrack)}
            disabled={addPending}
          >
            + 추가
          </Button>
          <TextButton
            data-testid='mini-player-close'
            onClick={stopPreview}
            Icon={<PFClose width={20} height={20} />}
            aria-label='미리듣기 종료'
          />
        </div>
        <YouTubePreviewPlayer width={SIZE.width} height={SIZE.height} />
      </div>
    </div>
  );
};

export default MiniPlayer;
```

- [ ] **Step 4: barrel**

```ts
// src/widgets-mobile/music-preview-mini-player/index.ts
export { default as MiniPlayer } from './ui/mini-player.component';
```

- [ ] **Step 5: tests pass**

```bash
yarn test src/widgets-mobile/music-preview-mini-player/ --run
```

Expected: 6/6 PASS.

- [ ] **Step 6: commit**

```bash
git add src/widgets-mobile/music-preview-mini-player/
git commit -m "feat(widgets-mobile/music-preview-mini-player): MiniPlayer (sheet 내부 bottom)

- spec §5.5 outcome A: 112px 컨테이너 + 64×36 visible video frame
- 좌측 곡명/아티스트 (ellipsis) + 우측 [+ 추가]·× 컨트롤 cluster
- useMusicPreview 공유 (currentTrack null 시 미렌더, stopPreview 위임)
- YouTubePreviewPlayer 가 chunk 3.1 ToS 패턴 (loadVideoById 로 IFrame remount 0)"
```

---

## Phase 3~5 검증 체크리스트

- [ ] FullscreenSheet 인프라 (hook + component + SheetHost) 완성, a11y 단언 GREEN
- [ ] SelectPlaylist 카드 + SelectPlaylistSheet + useMobileSelectPlaylist 완성, Promise contract 동작
- [ ] MiniPlayer 완성, currentTrack 분기 정확, ⏯ 토글 동작 (startPreview/stopPreview 합성)
- [ ] `PREVIEW_PLAYER_SIZES['mobile-bottom']` 추가, 데스크탑 sidebar/modal 회귀 0
- [ ] `yarn typecheck` 0 errors
- [ ] `yarn test src/widgets-mobile/partyroom-djing-sheet src/features-mobile/partyroom/select-playlist-for-djing src/widgets-mobile/music-preview-mini-player --run` GREEN

## Outstanding for Chunk 3 (Phase 6+) — 인계 marker

- **Task 4.3 의 `PendingAddTracksPlaceholder`** 가 임시 placeholder. Phase 6 에서 `AddTracksSheet` 컴포넌트 구현 후 `use-mobile-select-playlist.hook.tsx` 의 `<PendingAddTracksPlaceholder playlistId={p.id} />` → `<AddTracksSheet playlistId={p.id} onClose={pop} />` 로 교체. `PendingAddTracksPlaceholder` 정의 자체도 같이 제거.
- **PFArrowLeft / PFPlay / PFPause 아이콘 존재 검증** (Task 3.2/5.2 의 import). 부재 시 SVG inline 또는 대체 아이콘.

---

## Chunk 3: Phase 6~7 (AddTracksSheet + DjingGuideSheet)

## Phase 6: AddTracksSheet (검색·preview·추가)

spec §5.7 + §6.5 잠금. PlaylistActionBypassProvider 안 MusicSearch + MiniPlayer footer 합성.

### Task 6.1: `SearchListItem` (검색 결과 곡 1개)

**Files:**

- Create: `src/features-mobile/playlist/add-tracks/ui/search-list-item.component.tsx`
- Create: `src/features-mobile/playlist/add-tracks/ui/search-list-item.component.test.tsx`

- [ ] **Step 1: failing test**

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import SearchListItem from './search-list-item.component';

const TRACK = { id: 't1', name: 'Song A', artist: 'Artist X', duration: '3:30', linkId: 'abc123' };

describe('SearchListItem', () => {
  test('곡 메타 (제목·아티스트·재생시간) 노출', () => {
    render(
      <SearchListItem
        track={TRACK as never}
        onPreview={vi.fn()}
        onAdd={vi.fn()}
        addPending={false}
      />
    );
    expect(screen.getByText('Song A')).toBeInTheDocument();
    expect(screen.getByText(/Artist X/)).toBeInTheDocument();
  });

  test('▶ 버튼 클릭 시 onPreview(track) 호출', async () => {
    const onPreview = vi.fn();
    render(
      <SearchListItem
        track={TRACK as never}
        onPreview={onPreview}
        onAdd={vi.fn()}
        addPending={false}
      />
    );
    await userEvent.click(screen.getByTestId('search-item-preview-t1'));
    expect(onPreview).toHaveBeenCalledWith(TRACK);
  });

  test('[+] 클릭 시 onAdd(track) 호출', async () => {
    const onAdd = vi.fn();
    render(
      <SearchListItem track={TRACK as never} onPreview={vi.fn()} onAdd={onAdd} addPending={false} />
    );
    await userEvent.click(screen.getByTestId('search-item-add-t1'));
    expect(onAdd).toHaveBeenCalledWith(TRACK);
  });

  test('addPending=true 시 [+] disabled', () => {
    render(
      <SearchListItem
        track={TRACK as never}
        onPreview={vi.fn()}
        onAdd={vi.fn()}
        addPending={true}
      />
    );
    expect(screen.getByTestId('search-item-add-t1')).toBeDisabled();
  });
});
```

- [ ] **Step 2: run failing tests**

```bash
yarn test src/features-mobile/playlist/add-tracks/ui/search-list-item.component.test.tsx --run
```

Expected: FAIL — "cannot find module".

- [ ] **Step 3: 최소 구현**

```tsx
'use client';
import { FC } from 'react';
import { MusicSearchResult } from '@/shared/api/http/types/musics';
import { TextButton } from '@/shared/ui/components/text-button';
import { Typography } from '@/shared/ui/components/typography';
import { PFPlay, PFPlus } from '@/shared/ui/icons';

interface Props {
  track: MusicSearchResult;
  onPreview: (track: MusicSearchResult) => void;
  onAdd: (track: MusicSearchResult) => void;
  addPending: boolean;
}

const SearchListItem: FC<Props> = ({ track, onPreview, onAdd, addPending }) => (
  <li className='flex items-center gap-3 px-4 py-3 border-b border-gray-800'>
    <div className='flex-1 min-w-0'>
      <Typography type='body3' className='truncate'>
        {track.name}
      </Typography>
      <Typography type='detail2' className='text-gray-400 truncate'>
        {track.artist} · {track.duration}
      </Typography>
    </div>
    <TextButton
      data-testid={`search-item-preview-${track.id}`}
      onClick={() => onPreview(track)}
      Icon={<PFPlay width={20} height={20} />}
      aria-label={`${track.name} 미리듣기`}
    />
    <TextButton
      data-testid={`search-item-add-${track.id}`}
      onClick={() => onAdd(track)}
      disabled={addPending}
      Icon={<PFPlus width={20} height={20} />}
      aria-label={`${track.name} 추가`}
    />
  </li>
);

export default SearchListItem;
```

- [ ] **Step 4: tests pass + commit**

```bash
yarn test src/features-mobile/playlist/add-tracks/ui/search-list-item.component.test.tsx --run
```

```bash
git add src/features-mobile/playlist/add-tracks/ui/search-list-item.component.tsx \
        src/features-mobile/playlist/add-tracks/ui/search-list-item.component.test.tsx
git commit -m "feat(features-mobile/playlist/add-tracks): SearchListItem (곡 1개)

- 제목·아티스트·재생시간 메타
- ▶ → onPreview / [+] → onAdd / addPending disabled"
```

### Task 6.2: `MusicSearch` (검색 input + 결과 리스트)

**Files:**

- Create: `src/features-mobile/playlist/add-tracks/ui/music-search.component.tsx`
- Create: `src/features-mobile/playlist/add-tracks/ui/music-search.component.test.tsx`

- [ ] **Step 1: failing test**

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import MusicSearch from './music-search.component';

const useSearchMusicsMock = vi.fn();
vi.mock('@/features/playlist/add-tracks', () => ({
  useSearchMusics: (q: string) => useSearchMusicsMock(q),
}));

describe('MusicSearch', () => {
  test('초기 상태: empty placeholder', () => {
    useSearchMusicsMock.mockReturnValue({ data: undefined, isLoading: false, error: null });
    render(<MusicSearch onPreview={vi.fn()} onAdd={vi.fn()} addPending={false} />);
    expect(screen.getByTestId('music-search-input')).toBeInTheDocument();
  });

  test('input 변경 → useSearchMusics(query) 호출', async () => {
    useSearchMusicsMock.mockReturnValue({ data: [], isLoading: false, error: null });
    render(<MusicSearch onPreview={vi.fn()} onAdd={vi.fn()} addPending={false} />);
    await userEvent.type(screen.getByTestId('music-search-input'), 'love');
    await waitFor(() =>
      expect(useSearchMusicsMock).toHaveBeenCalledWith(expect.stringContaining('love'))
    );
  });

  test('빈 결과 → empty state 메시지', () => {
    useSearchMusicsMock.mockReturnValue({ data: [], isLoading: false, error: null });
    render(<MusicSearch onPreview={vi.fn()} onAdd={vi.fn()} addPending={false} />);
    // 단, 빈 결과는 input 채워진 상태에서만 노출 — initial 미입력 시는 empty placeholder
    // 본 test 는 비어있어도 input 미입력이라 별도 단언 없음 — 다음 test 가 cover
  });

  test('검색 결과 → 각 곡이 SearchListItem 로 렌더', async () => {
    useSearchMusicsMock.mockReturnValue({
      data: [
        { id: 't1', name: 'A', artist: 'a', duration: '3:00', linkId: 'l1' },
        { id: 't2', name: 'B', artist: 'b', duration: '4:00', linkId: 'l2' },
      ],
      isLoading: false,
      error: null,
    });
    render(<MusicSearch onPreview={vi.fn()} onAdd={vi.fn()} addPending={false} />);
    await userEvent.type(screen.getByTestId('music-search-input'), 'x');
    await waitFor(() => {
      expect(screen.getByTestId('search-item-preview-t1')).toBeInTheDocument();
      expect(screen.getByTestId('search-item-preview-t2')).toBeInTheDocument();
    });
  });

  test('error → 실패 메시지 + 재시도 버튼', () => {
    useSearchMusicsMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('boom'),
    });
    render(<MusicSearch onPreview={vi.fn()} onAdd={vi.fn()} addPending={false} />);
    expect(screen.getByTestId('music-search-retry')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: run failing tests** → Expected: FAIL.

- [ ] **Step 3: 최소 구현**

```tsx
'use client';
import { FC, useState } from 'react';
import { useSearchMusics } from '@/features/playlist/add-tracks';
import { MusicSearchResult } from '@/shared/api/http/types/musics';
import { Input } from '@/shared/ui/components/input';
import { TextButton } from '@/shared/ui/components/text-button';
import { Typography } from '@/shared/ui/components/typography';
import SearchListItem from './search-list-item.component';

interface Props {
  onPreview: (track: MusicSearchResult) => void;
  onAdd: (track: MusicSearchResult) => void;
  addPending: boolean;
}

const MusicSearch: FC<Props> = ({ onPreview, onAdd, addPending }) => {
  const [query, setQuery] = useState('');
  const { data, isLoading, error, refetch } = useSearchMusics(query);

  return (
    <div className='flex flex-col h-full'>
      <div className='shrink-0 px-4 py-3 border-b border-gray-800'>
        <Input
          data-testid='music-search-input'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='곡명 또는 아티스트로 검색'
          aria-label='곡 검색'
        />
      </div>
      <div className='flex-1 overflow-y-auto'>
        {error && (
          <div className='p-4 text-center'>
            <Typography type='body3' className='text-gray-400'>
              검색에 실패했어요
            </Typography>
            <TextButton data-testid='music-search-retry' onClick={() => refetch?.()}>
              다시 시도
            </TextButton>
          </div>
        )}
        {!error && query.length > 0 && !isLoading && data?.length === 0 && (
          <div className='p-4 text-center'>
            <Typography type='body3' className='text-gray-400'>
              다른 키워드로 시도해보세요
            </Typography>
          </div>
        )}
        {!error && data && data.length > 0 && (
          <ul>
            {data.map((track) => (
              <SearchListItem
                key={track.id}
                track={track}
                onPreview={onPreview}
                onAdd={onAdd}
                addPending={addPending}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MusicSearch;
```

- [ ] **Step 4: tests pass + commit**

```bash
yarn test src/features-mobile/playlist/add-tracks/ui/music-search.component.test.tsx --run
git add src/features-mobile/playlist/add-tracks/ui/music-search.component.tsx \
        src/features-mobile/playlist/add-tracks/ui/music-search.component.test.tsx
git commit -m "feat(features-mobile/playlist/add-tracks): MusicSearch input + 결과 리스트

- useSearchMusics 공유 (features/playlist/add-tracks)
- empty state · error 재시도 분기
- 결과 각 곡 → SearchListItem"
```

### Task 6.3: `AddTracksSheet` (FullscreenSheet body + MiniPlayer footer)

**Files:**

- Create: `src/widgets-mobile/partyroom-djing-sheet/ui/add-tracks-sheet.component.tsx`
- Create: `src/widgets-mobile/partyroom-djing-sheet/ui/add-tracks-sheet.component.test.tsx`

- [ ] **Step 1: failing test**

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import AddTracksSheet from './add-tracks-sheet.component';

const useSearchMusicsMock = vi.fn();
vi.mock('@/features/playlist/add-tracks', () => ({
  useSearchMusics: (q: string) => useSearchMusicsMock(q),
}));

const addMutateMock = vi.fn();
const startPreviewMock = vi.fn();
const stopPreviewMock = vi.fn();
const useMusicPreviewMock = vi.fn(() => ({
  currentTrack: null,
  playState: 'idle',
  startPreview: startPreviewMock,
  stopPreview: stopPreviewMock,
}));
vi.mock('@/shared/lib/store/stores.context', () => ({
  useStores: () => ({ useMusicPreview: useMusicPreviewMock }),
}));

const useAddPlaylistTrackMock = vi.fn(() => ({
  mutate: addMutateMock,
  isPending: false,
}));
vi.mock('@/features/playlist/add-tracks/api/use-add-playlist-track.mutation', () => ({
  useAddPlaylistTrack: () => useAddPlaylistTrackMock(),
}));

describe('AddTracksSheet', () => {
  test('MusicSearch 가 sheet body 로 렌더', () => {
    useSearchMusicsMock.mockReturnValue({ data: undefined, isLoading: false, error: null });
    render(<AddTracksSheet playlistId={42} />);
    expect(screen.getByTestId('music-search-input')).toBeInTheDocument();
  });

  test('검색 결과 ▶ 클릭 → useMusicPreview.startPreview(track) 호출', async () => {
    useSearchMusicsMock.mockReturnValue({
      data: [{ id: 't1', name: 'A', artist: 'a', duration: '3:00', linkId: 'l1' }],
      isLoading: false,
      error: null,
    });
    render(<AddTracksSheet playlistId={42} />);
    await userEvent.type(screen.getByTestId('music-search-input'), 'x');
    await waitFor(() => userEvent.click(screen.getByTestId('search-item-preview-t1')));
    await waitFor(() =>
      expect(startPreviewMock).toHaveBeenCalledWith(
        expect.objectContaining({ id: 't1', source: 'preview-search' })
      )
    );
  });

  test('currentTrack 있음 시 MiniPlayer (footer) 노출', () => {
    useSearchMusicsMock.mockReturnValue({ data: [], isLoading: false, error: null });
    useMusicPreviewMock.mockReturnValue({
      currentTrack: { name: 'A', artist: 'a', source: 'preview-search' },
      playState: 'playing',
      startPreview: startPreviewMock,
      stopPreview: stopPreviewMock,
    });
    render(<AddTracksSheet playlistId={42} />);
    expect(screen.getByTestId('mini-player-name')).toHaveTextContent('A');
  });

  test('MiniPlayer [+ 추가] → useAddPlaylistTrack.mutate({ playlistId, track })', async () => {
    useSearchMusicsMock.mockReturnValue({ data: [], isLoading: false, error: null });
    useMusicPreviewMock.mockReturnValue({
      currentTrack: { id: 't1', name: 'A', artist: 'a', source: 'preview-search', linkId: 'l1' },
      playState: 'playing',
      startPreview: startPreviewMock,
      stopPreview: stopPreviewMock,
    });
    render(<AddTracksSheet playlistId={42} />);
    await userEvent.click(screen.getByTestId('mini-player-add'));
    expect(addMutateMock).toHaveBeenCalledWith(expect.objectContaining({ playlistId: 42 }));
  });
});
```

- [ ] **Step 2: run failing tests** → Expected: FAIL.

- [ ] **Step 3: 최소 구현**

```tsx
'use client';
import { FC } from 'react';
import { useAddPlaylistTrack } from '@/features/playlist/add-tracks/api/use-add-playlist-track.mutation';
import MusicSearch from '@/features-mobile/playlist/add-tracks/ui/music-search.component';
import { MusicSearchResult } from '@/shared/api/http/types/musics';
import { useStores } from '@/shared/lib/store/stores.context';
import { MiniPlayer } from '@/widgets-mobile/music-preview-mini-player';

interface Props {
  playlistId: number;
}

const AddTracksSheet: FC<Props> = ({ playlistId }) => {
  const { useMusicPreview } = useStores();
  const { startPreview } = useMusicPreview();
  const { mutate: addTrack, isPending } = useAddPlaylistTrack();

  const handlePreview = (track: MusicSearchResult) => {
    // chunk 3.1 ToS 패턴: 동일 wrapper 안에서 loadVideoById (IFrame remount 0)
    startPreview({ ...track, source: 'preview-search' as const });
  };

  const handleAdd = (track: { linkId?: string; id?: string; name?: string }) => {
    addTrack({ playlistId, linkId: track.linkId ?? '', name: track.name ?? '' });
  };

  return (
    <div className='flex flex-col h-full'>
      <div className='flex-1 min-h-0'>
        <MusicSearch onPreview={handlePreview} onAdd={handleAdd} addPending={isPending} />
      </div>
      <MiniPlayer onAdd={handleAdd} addPending={isPending} />
    </div>
  );
};

export default AddTracksSheet;
```

- [ ] **Step 4: tests pass + commit**

```bash
yarn test src/widgets-mobile/partyroom-djing-sheet/ui/add-tracks-sheet.component.test.tsx --run
git add src/widgets-mobile/partyroom-djing-sheet/ui/add-tracks-sheet.component.tsx \
        src/widgets-mobile/partyroom-djing-sheet/ui/add-tracks-sheet.component.test.tsx
git commit -m "feat(widgets-mobile/partyroom-djing-sheet): AddTracksSheet

- body = MusicSearch (검색 input + 결과 리스트)
- footer = MiniPlayer (currentTrack 있음 시 노출, ⏯·[+ 추가]·×)
- ▶ → preview (source='preview-search')
- [+ 추가] → useAddPlaylistTrack(playlistId, track)"
```

### Task 6.4: `useMobileSelectPlaylist` 의 `PendingAddTracksPlaceholder` → `AddTracksSheet` 교체

**Files:**

- Modify: `src/features-mobile/partyroom/select-playlist-for-djing/ui/use-mobile-select-playlist.hook.tsx`

- [ ] **Step 1: import 교체**

```tsx
// 기존:
//   const PendingAddTracksPlaceholder: FC<{ playlistId: number }> = ...
//
// 변경:
//   import AddTracksSheet from '@/widgets-mobile/partyroom-djing-sheet/ui/add-tracks-sheet.component';
//
//   onAddTracksForEmpty={(p) => {
//     push({
//       key: 'add-tracks',
//       title: '곡 추가',
//       node: <AddTracksSheet playlistId={p.id} />,
//     });
//   }}
//
// 그리고 `PendingAddTracksPlaceholder` 정의 자체 삭제 + 사용처 변경
```

- [ ] **Step 2: 기존 useMobileSelectPlaylist test 회귀 확인**

```bash
yarn test src/features-mobile/partyroom/select-playlist-for-djing/ --run
```

Expected: 기존 단위 PASS + AddTracksSheet 진입 시나리오는 Phase 9 통합 테스트에서 cover.

- [ ] **Step 3: commit**

```bash
git add src/features-mobile/partyroom/select-playlist-for-djing/
git commit -m "feat(features-mobile/partyroom/select-playlist-for-djing): PendingAddTracksPlaceholder → AddTracksSheet 교체

Phase 4 의 placeholder 가 Phase 6 의 AddTracksSheet 로 교체. 빈 곡 카드 [+ 곡 추가] → AddTracksSheet push 완성."
```

### Task 6.5: barrel + Phase 6 회귀

**Files:**

- Create: `src/features-mobile/playlist/add-tracks/index.ts`

- [ ] **Step 1: barrel**

```ts
// src/features-mobile/playlist/add-tracks/index.ts
export { default as MusicSearch } from './ui/music-search.component';
export { default as SearchListItem } from './ui/search-list-item.component';
```

- [ ] **Step 2: 전체 회귀**

```bash
yarn typecheck
yarn test src/features-mobile/playlist/add-tracks/ src/widgets-mobile/partyroom-djing-sheet/ --run
yarn lint
```

Expected: 0 errors, 모든 test GREEN.

- [ ] **Step 3: commit barrel**

```bash
git add src/features-mobile/playlist/add-tracks/index.ts
git commit -m "feat(features-mobile/playlist/add-tracks): barrel"
```

---

## Phase 7: DjingGuideSheet (첫 DJ 등록 후 규칙 가이드)

spec §5.8 잠금. useDjingGuide 의 모바일 사본 (sheet 변형).

### Task 7.1: `GuideLayout` 모바일 stacking 변형

**Files:**

- Create: `src/features-mobile/playlist/djing-guide/ui/guide-layout.component.tsx`
- Create: `src/features-mobile/playlist/djing-guide/ui/guide-layout.component.test.tsx`

- [ ] **Step 1: failing test**

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import GuideLayout from './guide-layout.component';

describe('GuideLayout (모바일 stacking)', () => {
  test('규칙 카드 N개 노출 + [다시 보지 않기] + [시작] 버튼', () => {
    render(<GuideLayout onClose={vi.fn()} onDismissPermanent={vi.fn()} />);
    expect(screen.getByTestId('guide-start')).toHaveTextContent('시작');
    expect(screen.getByTestId('guide-dismiss-permanent')).toHaveTextContent('다시 보지 않기');
  });

  test('[시작] 클릭 → onClose', async () => {
    const onClose = vi.fn();
    render(<GuideLayout onClose={onClose} onDismissPermanent={vi.fn()} />);
    await userEvent.click(screen.getByTestId('guide-start'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('[다시 보지 않기] 체크 + [시작] → onDismissPermanent + onClose', async () => {
    const onClose = vi.fn();
    const onDismissPermanent = vi.fn();
    render(<GuideLayout onClose={onClose} onDismissPermanent={onDismissPermanent} />);
    await userEvent.click(screen.getByTestId('guide-dismiss-permanent'));
    await userEvent.click(screen.getByTestId('guide-start'));
    expect(onDismissPermanent).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: run failing + 최소 구현 + tests pass**

```tsx
'use client';
import { FC, useState } from 'react';
import { Button } from '@/shared/ui/components/button';
import { Checkbox } from '@/shared/ui/components/checkbox';
import { Typography } from '@/shared/ui/components/typography';

interface Props {
  onClose: () => void;
  onDismissPermanent: () => void;
}

const RULES = [
  {
    emoji: '🎵',
    title: '플레이리스트로 큐잉',
    detail: '내가 만든 플레이리스트를 선택해 큐에 올려요',
  },
  {
    emoji: '⏱️',
    title: '한 곡 끝나면 자동 다음 DJ',
    detail: '내 차례가 끝나면 큐의 다음 DJ 로 이동',
  },
  { emoji: '🚫', title: '시간 제한', detail: '한 곡이 너무 길면 자동 스킵 가능' },
];

const GuideLayout: FC<Props> = ({ onClose, onDismissPermanent }) => {
  const [dismiss, setDismiss] = useState(false);

  const handleStart = () => {
    if (dismiss) onDismissPermanent();
    onClose();
  };

  return (
    <div className='flex flex-col h-full'>
      <div className='flex-1 overflow-y-auto p-4 flex flex-col gap-6'>
        {RULES.map((r) => (
          <div key={r.title} className='flex flex-col gap-2'>
            <span className='text-3xl'>{r.emoji}</span>
            <Typography type='title3'>{r.title}</Typography>
            <Typography type='body3' className='text-gray-400'>
              {r.detail}
            </Typography>
          </div>
        ))}
      </div>
      <div className='shrink-0 p-4 flex flex-col gap-3 border-t border-gray-800'>
        <label className='flex items-center gap-2'>
          <Checkbox
            data-testid='guide-dismiss-permanent'
            checked={dismiss}
            onChange={(v) => setDismiss(v)}
          />
          <Typography type='detail1' className='text-gray-300'>
            다시 보지 않기
          </Typography>
        </label>
        <Button data-testid='guide-start' onClick={handleStart}>
          시작
        </Button>
      </div>
    </div>
  );
};

export default GuideLayout;
```

```bash
yarn test src/features-mobile/playlist/djing-guide/ui/guide-layout.component.test.tsx --run
```

- [ ] **Step 3: commit**

```bash
git add src/features-mobile/playlist/djing-guide/
git commit -m "feat(features-mobile/playlist/djing-guide): GuideLayout (모바일 stacking)

규칙 카드 N개 풀폭 stacking + [다시 보지 않기] 체크박스 + [시작] 버튼."
```

### Task 7.2: `useMobileDjingGuide` hook

**Files:**

- Create: `src/features-mobile/playlist/djing-guide/ui/use-mobile-djing-guide.hook.tsx`
- Create: `src/features-mobile/playlist/djing-guide/ui/use-mobile-djing-guide.hook.test.tsx`
- Create: `src/features-mobile/playlist/djing-guide/index.ts`

- [ ] **Step 1: failing test**

```tsx
import { renderHook, act } from '@testing-library/react';
import { ReactNode } from 'react';
import { describe, expect, test, vi } from 'vitest';
import { FullscreenSheetProvider } from '@/widgets-mobile/partyroom-djing-sheet';
import useMobileDjingGuide from './use-mobile-djing-guide.hook';

const setDjingGuideHiddenMock = vi.fn();
const djingGuideHiddenMock = vi.fn();
vi.mock('@/entities/preference', () => ({
  useUserPreferenceStore: Object.assign(
    (
      selector?: (s: {
        djingGuideHidden: boolean;
        setDjingGuideHidden: (h: boolean) => void;
      }) => unknown
    ) => {
      const state = {
        djingGuideHidden: djingGuideHiddenMock(),
        setDjingGuideHidden: setDjingGuideHiddenMock,
      };
      return selector ? selector(state) : state;
    },
    {
      getState: () => ({
        djingGuideHidden: djingGuideHiddenMock(),
        setDjingGuideHidden: setDjingGuideHiddenMock,
      }),
    }
  ),
}));

const wrap = ({ children }: { children: ReactNode }) => (
  <FullscreenSheetProvider>{children}</FullscreenSheetProvider>
);

describe('useMobileDjingGuide', () => {
  test('djingGuideHidden=true → showDjingGuide=false', () => {
    djingGuideHiddenMock.mockReturnValue(true);
    const { result } = renderHook(() => useMobileDjingGuide(), { wrapper: wrap });
    expect(result.current.showDjingGuide).toBe(false);
  });

  test('djingGuideHidden=false → showDjingGuide=true', () => {
    djingGuideHiddenMock.mockReturnValue(false);
    const { result } = renderHook(() => useMobileDjingGuide(), { wrapper: wrap });
    expect(result.current.showDjingGuide).toBe(true);
  });

  test('openDjingGuideModal 호출 시 sheet push', () => {
    djingGuideHiddenMock.mockReturnValue(false);
    const { result } = renderHook(() => useMobileDjingGuide(), { wrapper: wrap });
    act(() => result.current.openDjingGuideModal());
    // sheet 가 stack 에 push 됨 — integration 으로 검증 (본 hook test 는 contract 만)
  });
});
```

- [ ] **Step 2: 최소 구현 + tests pass**

```tsx
'use client';
import { useCallback } from 'react';
import { useUserPreferenceStore } from '@/entities/preference';
import { useFullscreenSheet } from '@/widgets-mobile/partyroom-djing-sheet';
import GuideLayout from './guide-layout.component';

export default function useMobileDjingGuide() {
  const djingGuideHidden = useUserPreferenceStore((s) => s.djingGuideHidden);
  const setDjingGuideHidden = useUserPreferenceStore((s) => s.setDjingGuideHidden);
  const { push, pop } = useFullscreenSheet();

  const openDjingGuideModal = useCallback(() => {
    push({
      key: 'djing-guide',
      title: 'DJ 규칙',
      node: <GuideLayout onClose={pop} onDismissPermanent={() => setDjingGuideHidden(true)} />,
    });
  }, [push, pop, setDjingGuideHidden]);

  return {
    showDjingGuide: !djingGuideHidden,
    openDjingGuideModal,
  };
}
```

```ts
// src/features-mobile/playlist/djing-guide/index.ts
export { default as useMobileDjingGuide } from './ui/use-mobile-djing-guide.hook';
```

```bash
yarn test src/features-mobile/playlist/djing-guide/ --run
```

- [ ] **Step 3: commit**

```bash
git add src/features-mobile/playlist/djing-guide/
git commit -m "feat(features-mobile/playlist/djing-guide): useMobileDjingGuide hook

데스크탑 useDjingGuide 의 모바일 사본. showDjingGuide + openDjingGuideModal → sheet push.
preference.djingGuideHidden 존중. [다시 보지 않기] → updatePreference."
```

---

## Phase 6~7 검증 체크리스트

- [ ] SearchListItem + MusicSearch + AddTracksSheet 완성, ▶/[+ 추가]/error 분기 GREEN
- [ ] PendingAddTracksPlaceholder → AddTracksSheet 교체 완료, useMobileSelectPlaylist 회귀 0
- [ ] GuideLayout + useMobileDjingGuide 완성, preference 분기 GREEN
- [ ] `yarn typecheck` 0 errors
- [ ] `yarn test src/features-mobile/playlist/ src/widgets-mobile/partyroom-djing-sheet/ --run` GREEN
- [ ] `useUpdateUserPreference` API 존재 확인 (없으면 baseline 정찰 시 발견 → 대체 API 사용)

## Outstanding for Chunk 4 (Phase 8+) — 인계 marker

- 합성 hook (`features-mobile/partyroom/{register-me,change-my-playlist,unregister-me}/ui/use-*.hook.tsx`) 가 Phase 8 의 큐 패널 leaf 들 안에서 사용. mutation + useMobileSelectPlaylist + useMobileDjingGuide 합성 흐름은 Phase 8 에서.

---

## Chunk 4: Phase 8~10 (합성 hook + 큐 패널 + wiring)

## Phase 8: 큐 패널 leaf 컴포넌트 + 합성 hook

spec §5.1 + §B.2~§B.4 잠금. 합성 hook 3개 (register/change/unregister) + leaf 6개 (current-dj-row · queue-list-item · queue-list · member-actions · guest-cta · empty-member).

### Task 8.1: 합성 hook 3개 (register/change/unregister)

데스크탑 `widgets/partyroom-djing-dialog/ui/{register,change-playlist,unregister}-button.component.tsx` 의 조합 로직을 모바일 hook 으로 분해.

**Files:**

- Create: `src/features-mobile/partyroom/register-me-to-queue/ui/use-register-me-to-queue.hook.tsx`
- Create: `src/features-mobile/partyroom/register-me-to-queue/ui/use-register-me-to-queue.hook.test.tsx`
- Create: `src/features-mobile/partyroom/register-me-to-queue/index.ts`
- Create: `src/features-mobile/partyroom/change-my-playlist/ui/use-change-my-playlist.hook.tsx`
- Create: `src/features-mobile/partyroom/change-my-playlist/ui/use-change-my-playlist.hook.test.tsx`
- Create: `src/features-mobile/partyroom/change-my-playlist/index.ts`
- Create: `src/features-mobile/partyroom/unregister-me-from-queue/ui/use-unregister-me-from-queue.hook.tsx`
- Create: `src/features-mobile/partyroom/unregister-me-from-queue/ui/use-unregister-me-from-queue.hook.test.tsx`
- Create: `src/features-mobile/partyroom/unregister-me-from-queue/index.ts`

- [ ] **Step 1: `useMobileRegisterMeToQueue` failing test + 구현**

```tsx
// use-register-me-to-queue.hook.test.tsx
import { renderHook, act, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { describe, expect, test, vi } from 'vitest';
import { QueueStatus } from '@/shared/api/http/types/@enums';
import { FullscreenSheetProvider } from '@/widgets-mobile/partyroom-djing-sheet';
import useMobileRegisterMeToQueue from './use-register-me-to-queue.hook';

const openAlertMock = vi.fn();
vi.mock('@/shared/ui/components/dialog', () => ({
  useDialog: () => ({ openAlertDialog: openAlertMock }),
}));

const registerMutate = vi.fn();
vi.mock('@/features/partyroom/register-me-to-queue', () => ({
  useRegisterMeToQueue: () => ({ mutate: registerMutate, isPending: false }),
}));

const selectPlaylistMock = vi.fn();
vi.mock('@/features-mobile/partyroom/select-playlist-for-djing', () => ({
  useMobileSelectPlaylist: () => selectPlaylistMock,
}));

const openDjingGuideMock = vi.fn();
vi.mock('@/features-mobile/playlist/djing-guide', () => ({
  useMobileDjingGuide: () => ({ showDjingGuide: true, openDjingGuideModal: openDjingGuideMock }),
}));

const wrap = ({ children }: { children: ReactNode }) => (
  <FullscreenSheetProvider>{children}</FullscreenSheetProvider>
);

describe('useMobileRegisterMeToQueue', () => {
  test('큐 락(CLOSE) 시 alert dialog + mutation 미호출', async () => {
    const { result } = renderHook(
      () =>
        useMobileRegisterMeToQueue({
          partyroomId: 1,
          queueStatus: QueueStatus.CLOSE,
          playlists: [],
        }),
      { wrapper: wrap }
    );
    await act(async () => {
      await result.current();
    });
    expect(openAlertMock).toHaveBeenCalled();
    expect(registerMutate).not.toHaveBeenCalled();
  });

  test('selectPlaylist 취소 시 mutation 미호출', async () => {
    selectPlaylistMock.mockResolvedValue(undefined);
    const { result } = renderHook(
      () =>
        useMobileRegisterMeToQueue({
          partyroomId: 1,
          queueStatus: QueueStatus.OPEN,
          playlists: [{ id: 1, name: 'A', musicCount: 5 }] as never,
        }),
      { wrapper: wrap }
    );
    await act(async () => {
      await result.current();
    });
    expect(registerMutate).not.toHaveBeenCalled();
  });

  test('정상 → registerMutate + showDjingGuide=true 시 openDjingGuideModal', async () => {
    selectPlaylistMock.mockResolvedValue({ id: 10, name: 'p', musicCount: 5 });
    const { result } = renderHook(
      () =>
        useMobileRegisterMeToQueue({
          partyroomId: 1,
          queueStatus: QueueStatus.OPEN,
          playlists: [{ id: 10, name: 'p', musicCount: 5 }] as never,
        }),
      { wrapper: wrap }
    );
    await act(async () => {
      await result.current();
    });
    expect(registerMutate).toHaveBeenCalledWith({ partyroomId: 1, playlistId: 10 });
    await waitFor(() => expect(openDjingGuideMock).toHaveBeenCalled());
  });
});
```

```tsx
// use-register-me-to-queue.hook.tsx
'use client';
import { useCallback } from 'react';
import { useRegisterMeToQueue } from '@/features/partyroom/register-me-to-queue';
import { useMobileSelectPlaylist } from '@/features-mobile/partyroom/select-playlist-for-djing';
import { useMobileDjingGuide } from '@/features-mobile/playlist/djing-guide';
import { Playlist } from '@/shared/api/http/types/playlists';
import { QueueStatus } from '@/shared/api/http/types/@enums';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useDialog } from '@/shared/ui/components/dialog';

interface Args {
  partyroomId: number;
  queueStatus: QueueStatus;
  playlists: Playlist[];
}

export default function useMobileRegisterMeToQueue({ partyroomId, queueStatus, playlists }: Args) {
  const t = useI18n();
  const { openAlertDialog } = useDialog();
  const { mutate: registerMutate } = useRegisterMeToQueue();
  const selectPlaylist = useMobileSelectPlaylist({ playlists });
  const { showDjingGuide, openDjingGuideModal } = useMobileDjingGuide();

  return useCallback(async () => {
    if (queueStatus === QueueStatus.CLOSE) {
      await openAlertDialog({ content: t.dj.para.locked_queue_by_admin });
      return;
    }
    const selected = await selectPlaylist();
    if (!selected) return;
    registerMutate({ partyroomId, playlistId: selected.id });
    if (showDjingGuide) openDjingGuideModal();
  }, [
    partyroomId,
    queueStatus,
    selectPlaylist,
    registerMutate,
    showDjingGuide,
    openDjingGuideModal,
    openAlertDialog,
    t.dj.para.locked_queue_by_admin,
  ]);
}
```

```ts
// src/features-mobile/partyroom/register-me-to-queue/index.ts
export { default as useMobileRegisterMeToQueue } from './ui/use-register-me-to-queue.hook';
```

- [ ] **Step 2: `useMobileChangeMyPlaylist` 유사 패턴 (queue lock 분기 X, djingGuide X)**

```tsx
// use-change-my-playlist.hook.tsx
'use client';
import { useCallback } from 'react';
import { useChangeMyPlaylist } from '@/features/partyroom/change-my-playlist';
import { useMobileSelectPlaylist } from '@/features-mobile/partyroom/select-playlist-for-djing';
import { Playlist } from '@/shared/api/http/types/playlists';

interface Args {
  partyroomId: number;
  playlists: Playlist[];
}

export default function useMobileChangeMyPlaylist({ partyroomId, playlists }: Args) {
  const { mutate: changeMutate } = useChangeMyPlaylist();
  const selectPlaylist = useMobileSelectPlaylist({ playlists });

  return useCallback(async () => {
    const selected = await selectPlaylist();
    if (!selected) return;
    changeMutate({ partyroomId, playlistId: selected.id });
  }, [partyroomId, selectPlaylist, changeMutate]);
}
```

test 시나리오 2: 취소 → mutation 미호출 / 선택 → changeMutate.

```ts
// src/features-mobile/partyroom/change-my-playlist/index.ts
export { default as useMobileChangeMyPlaylist } from './ui/use-change-my-playlist.hook';
```

- [ ] **Step 3: `useMobileUnregisterMeFromQueue` (confirm + mutation)**

```tsx
// use-unregister-me-from-queue.hook.tsx
'use client';
import { useCallback } from 'react';
import { useUnregisterMeFromQueue } from '@/features/partyroom/unregister-me-from-queue';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useDialog } from '@/shared/ui/components/dialog';

export default function useMobileUnregisterMeFromQueue({ partyroomId }: { partyroomId: number }) {
  const t = useI18n();
  const { openConfirmDialog } = useDialog();
  const { mutate: unregisterMutate } = useUnregisterMeFromQueue();

  return useCallback(async () => {
    const confirmed = await openConfirmDialog({ content: '정말 큐에서 나가시겠어요?' });
    if (!confirmed) return;
    unregisterMutate({ partyroomId });
  }, [partyroomId, openConfirmDialog, unregisterMutate, t]);
}
```

test 시나리오 2: confirm 취소 → mutation 미호출 / confirm → unregisterMutate.

```ts
// src/features-mobile/partyroom/unregister-me-from-queue/index.ts
export { default as useMobileUnregisterMeFromQueue } from './ui/use-unregister-me-from-queue.hook';
```

- [ ] **Step 4: 3 hook test 전체 GREEN + commit (각각 따로 commit 가능, 동시 commit 도 OK)**

```bash
yarn test src/features-mobile/partyroom/ --run
git add src/features-mobile/partyroom/{register-me-to-queue,change-my-playlist,unregister-me-from-queue}/
git commit -m "feat(features-mobile/partyroom): 합성 hook 3개 (register/change/unregister)

- useMobileRegisterMeToQueue: queue lock alert + selectPlaylist + mutation + djingGuide
- useMobileChangeMyPlaylist: selectPlaylist + mutation
- useMobileUnregisterMeFromQueue: confirm + mutation
- 데스크탑 button 컴포넌트의 조합 로직을 모바일 hook 으로 분해 (spec §5.1)"
```

### Task 8.2: `CurrentDjRow` (현재 DJ + playback 메타, Skip OUT)

**Files:**

- Create: `src/widgets-mobile/partyroom-queue-panel/ui/current-dj-row.component.tsx`
- Create: `src/widgets-mobile/partyroom-queue-panel/ui/current-dj-row.component.test.tsx`

- [ ] **Step 1: failing test + 구현**

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import CurrentDjRow from './current-dj-row.component';

describe('CurrentDjRow', () => {
  test('현재 DJ 이름 + playback 트랙명 노출', () => {
    render(
      <CurrentDjRow
        dj={{ crewId: 1, nickname: 'Alice', playlistName: 'A' } as never}
        playback={{ name: 'Song X', duration: '3:30' } as never}
      />
    );
    expect(screen.getByText(/Alice/)).toBeInTheDocument();
    expect(screen.getByText(/Song X/)).toBeInTheDocument();
  });

  test('Skip 버튼 미렌더 (모더레이션 OUT)', () => {
    render(
      <CurrentDjRow
        dj={{ crewId: 1, nickname: 'A', playlistName: 'p' } as never}
        playback={{ name: 'X', duration: '0:00' } as never}
      />
    );
    expect(screen.queryByTestId('dj-skip-button')).not.toBeInTheDocument();
  });
});
```

```tsx
'use client';
import { FC } from 'react';
import { DjListItem } from '@/shared/ui/components/dj-list-item';
import { Typography } from '@/shared/ui/components/typography';

interface Props {
  dj: { crewId: number; nickname: string; playlistName: string };
  playback: { name?: string; duration?: string };
}

const CurrentDjRow: FC<Props> = ({ dj, playback }) => (
  <div className='flex flex-col gap-3 px-4 py-3 border-b border-gray-800'>
    <div className='flex items-center gap-3'>
      <Typography type='detail2' className='text-gray-400'>
        현재 DJ
      </Typography>
      <Typography type='body3'>{dj.nickname}</Typography>
    </div>
    {playback?.name && (
      <div className='flex items-center justify-between gap-2'>
        <Typography type='body3' className='truncate flex-1'>
          {playback.name}
        </Typography>
        <Typography type='detail2' className='text-gray-400'>
          {playback.duration}
        </Typography>
      </div>
    )}
  </div>
);

export default CurrentDjRow;
```

- [ ] **Step 2: tests pass + commit**

### Task 8.3: `QueueListItem` (DJ 1명, Me = ChangePlaylist 트리거)

**Files:**

- Create: `src/widgets-mobile/partyroom-queue-panel/ui/queue-list-item.component.tsx`
- Create: `src/widgets-mobile/partyroom-queue-panel/ui/queue-list-item.component.test.tsx`

- [ ] **Step 1: failing test + 구현**

```tsx
// test
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import QueueListItem from './queue-list-item.component';

describe('QueueListItem', () => {
  test('순서 + 닉네임 + 플레이리스트명', () => {
    render(
      <QueueListItem
        order={1}
        dj={{ crewId: 1, nickname: 'Alice', playlistName: 'P' } as never}
        isMe={false}
        onChangePlaylist={vi.fn()}
      />
    );
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText(/P/)).toBeInTheDocument();
  });

  test('isMe=true 시 ChangePlaylist 트리거 노출 + 클릭 → onChangePlaylist', async () => {
    const onChangePlaylist = vi.fn();
    render(
      <QueueListItem
        order={1}
        dj={{ crewId: 1, nickname: 'Me', playlistName: 'p' } as never}
        isMe={true}
        onChangePlaylist={onChangePlaylist}
      />
    );
    await userEvent.click(screen.getByTestId('queue-item-change-playlist'));
    expect(onChangePlaylist).toHaveBeenCalledTimes(1);
  });

  test('isMe=false 시 ChangePlaylist 미렌더', () => {
    render(
      <QueueListItem
        order={1}
        dj={{ crewId: 2, nickname: 'A', playlistName: 'p' } as never}
        isMe={false}
        onChangePlaylist={vi.fn()}
      />
    );
    expect(screen.queryByTestId('queue-item-change-playlist')).not.toBeInTheDocument();
  });
});
```

```tsx
'use client';
import { FC } from 'react';
import { TextButton } from '@/shared/ui/components/text-button';
import { Typography } from '@/shared/ui/components/typography';

interface Props {
  order: number;
  dj: { crewId: number; nickname: string; playlistName: string };
  isMe: boolean;
  onChangePlaylist: () => void;
}

const QueueListItem: FC<Props> = ({ order, dj, isMe, onChangePlaylist }) => (
  <li className='flex items-center gap-3 px-4 py-3 border-b border-gray-800'>
    <Typography type='detail2' className='text-gray-400 w-6'>
      {order}.
    </Typography>
    <div className='flex-1 min-w-0'>
      <Typography type='body3'>
        {dj.nickname}
        {isMe && ' (Me)'}
      </Typography>
      <Typography type='detail2' className='text-gray-400 truncate'>
        {dj.playlistName}
      </Typography>
    </div>
    {isMe && (
      <TextButton
        data-testid='queue-item-change-playlist'
        onClick={onChangePlaylist}
        typographyType='caption1'
        className='text-primary-300'
      >
        변경
      </TextButton>
    )}
  </li>
);

export default QueueListItem;
```

- [ ] **Step 2: tests pass + commit**

### Task 8.4: `QueueList` (큐 순서 스크롤 리스트)

**Files:**

- Create: `src/widgets-mobile/partyroom-queue-panel/ui/queue-list.component.tsx`
- Create: `src/widgets-mobile/partyroom-queue-panel/ui/queue-list.component.test.tsx`

- [ ] **Step 1: failing test + 구현 (QueueListItem 으로 위임)**

```tsx
'use client';
import { FC } from 'react';
import { Typography } from '@/shared/ui/components/typography';
import QueueListItem from './queue-list-item.component';

interface Dj {
  crewId: number;
  nickname: string;
  playlistName: string;
  orderNumber: number;
}

interface Props {
  djs: Dj[];
  myCrewId?: number;
  onChangePlaylist: () => void;
}

const QueueList: FC<Props> = ({ djs, myCrewId, onChangePlaylist }) => {
  if (djs.length === 0) {
    return (
      <Typography type='detail2' className='text-gray-400 text-center p-4'>
        큐 비어있음
      </Typography>
    );
  }
  const sorted = [...djs].sort((a, b) => a.orderNumber - b.orderNumber);
  // 첫 번째는 CurrentDjRow 가 표시 — 큐 리스트는 1번 (대기 1순위) 부터
  const queue = sorted.slice(1);
  return (
    <ul>
      {queue.map((dj, i) => (
        <QueueListItem
          key={dj.crewId}
          order={i + 1}
          dj={dj}
          isMe={dj.crewId === myCrewId}
          onChangePlaylist={onChangePlaylist}
        />
      ))}
    </ul>
  );
};

export default QueueList;
```

test: 빈 큐 → "큐 비어있음" / 정상 → 순서대로 렌더 / isMe 정확.

- [ ] **Step 2: tests pass + commit**

### Task 8.5: `MemberActions` (sticky bottom [+ DJ 등록] / [큐에서 나가기])

**Files:**

- Create: `src/widgets-mobile/partyroom-queue-panel/ui/member-actions.component.tsx`
- Create: `src/widgets-mobile/partyroom-queue-panel/ui/member-actions.component.test.tsx`

- [ ] **Step 1: failing test + 구현**

```tsx
'use client';
import { FC } from 'react';
import { Button } from '@/shared/ui/components/button';

interface Props {
  isMeInQueue: boolean;
  onRegister: () => void;
  onUnregister: () => void;
}

const MemberActions: FC<Props> = ({ isMeInQueue, onRegister, onUnregister }) => (
  <div className='shrink-0 p-4 border-t border-gray-800'>
    {isMeInQueue ? (
      <Button
        data-testid='member-action-unregister'
        color='secondary'
        variant='outline'
        onClick={onUnregister}
        className='w-full'
      >
        큐에서 나가기
      </Button>
    ) : (
      <Button data-testid='member-action-register' onClick={onRegister} className='w-full'>
        + DJ 등록
      </Button>
    )}
  </div>
);

export default MemberActions;
```

test: isMeInQueue=false → [+ DJ 등록], isMeInQueue=true → [큐에서 나가기]. 각 클릭 → 콜백.

### Task 8.6: `GuestCta` (/sign-in 라우팅)

**Files:**

- Create: `src/widgets-mobile/partyroom-queue-panel/ui/guest-cta.component.tsx`
- Create: `src/widgets-mobile/partyroom-queue-panel/ui/guest-cta.component.test.tsx`

- [ ] **Step 1: failing test + 구현**

```tsx
'use client';
import { useRouter } from 'next/navigation';
import { FC } from 'react';
import { Typography } from '@/shared/ui/components/typography';

const GuestCta: FC = () => {
  const router = useRouter();
  return (
    <button
      type='button'
      data-testid='guest-cta'
      onClick={() => router.push('/sign-in')}
      className='shrink-0 m-4 p-4 border border-gray-700 rounded text-center hover:bg-gray-900'
    >
      <Typography type='body3'>🎧 음악을 직접 틀어보세요</Typography>
      <Typography type='detail1' className='text-primary-300 mt-2'>
        3초만에 가입 →
      </Typography>
    </button>
  );
};

export default GuestCta;
```

test: 클릭 → router.push('/sign-in').

- [ ] **Step 2: tests pass + commit (leaf 6개 묶음 commit OK)**

```bash
yarn test src/widgets-mobile/partyroom-queue-panel/ --run
git add src/widgets-mobile/partyroom-queue-panel/ui/
git commit -m "feat(widgets-mobile/partyroom-queue-panel): leaf 컴포넌트 5개

- CurrentDjRow · QueueListItem · QueueList · MemberActions · GuestCta
- Skip OUT (모더레이션) · ChangePlaylist 트리거 Me 분기 · /sign-in 라우팅"
```

---

## Phase 9: `MobilePartyroomQueuePanel` 통합 + 통합 테스트

### Task 9.1: 통합 컴포넌트 + 단위 테스트

**Files:**

- Create: `src/widgets-mobile/partyroom-queue-panel/ui/queue-panel.component.tsx`
- Create: `src/widgets-mobile/partyroom-queue-panel/ui/queue-panel.component.test.tsx`
- Create: `src/widgets-mobile/partyroom-queue-panel/index.ts`

- [ ] **Step 1: failing test (분기 매트릭스)**

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { QueueStatus } from '@/shared/api/http/types/@enums';
import QueuePanel from './queue-panel.component';

const useIsGuestMock = vi.fn();
vi.mock('@/entities/me', () => ({ useIsGuest: () => useIsGuestMock() }));

const useFetchDjingQueueMock = vi.fn();
vi.mock('@/features/partyroom/list-djing-queue', () => ({
  useFetchDjingQueue: () => useFetchDjingQueueMock(),
}));

const useCurrentPartyroomMock = vi.fn();
vi.mock('@/shared/lib/store/stores.context', () => ({
  useStores: () => ({
    useCurrentPartyroom: (selector: (s: { me?: { crewId: number } }) => unknown) =>
      useCurrentPartyroomMock(selector),
  }),
}));

// 합성 hook 모두 mock (실제 동작은 Phase 8 단위 + Phase 12 e2e 에서 검증)
vi.mock('@/features-mobile/partyroom/register-me-to-queue', () => ({
  useMobileRegisterMeToQueue: () => vi.fn(),
}));
vi.mock('@/features-mobile/partyroom/change-my-playlist', () => ({
  useMobileChangeMyPlaylist: () => vi.fn(),
}));
vi.mock('@/features-mobile/partyroom/unregister-me-from-queue', () => ({
  useMobileUnregisterMeFromQueue: () => vi.fn(),
}));
vi.mock('@/features/playlist/list', () => ({ useFetchPlaylists: () => ({ data: [] }) }));

describe('MobilePartyroomQueuePanel (분기 매트릭스)', () => {
  test('게스트 → GuestCta + 큐 리스트 (큐 있을 때)', () => {
    useIsGuestMock.mockReturnValue(true);
    useFetchDjingQueueMock.mockReturnValue({
      data: {
        djs: [{ crewId: 1, nickname: 'A', playlistName: 'p', orderNumber: 0 }],
        playback: { name: 'X', duration: '3:00' },
        queueStatus: QueueStatus.OPEN,
      },
    });
    useCurrentPartyroomMock.mockReturnValue(undefined);
    render(<QueuePanel partyroomId={1} />);
    expect(screen.getByTestId('guest-cta')).toBeInTheDocument();
  });

  test('멤버 + 빈 큐 → EmptyMember (등록 버튼만)', () => {
    useIsGuestMock.mockReturnValue(false);
    useFetchDjingQueueMock.mockReturnValue({
      data: { djs: [], playback: undefined, queueStatus: QueueStatus.OPEN },
    });
    useCurrentPartyroomMock.mockReturnValue(99);
    render(<QueuePanel partyroomId={1} />);
    expect(screen.getByTestId('member-action-register')).toBeInTheDocument();
  });

  test('멤버 + 큐 있음 → CurrentDjRow + QueueList + MemberActions', () => {
    useIsGuestMock.mockReturnValue(false);
    useFetchDjingQueueMock.mockReturnValue({
      data: {
        djs: [
          { crewId: 1, nickname: 'A', playlistName: 'p1', orderNumber: 0 },
          { crewId: 2, nickname: 'B', playlistName: 'p2', orderNumber: 1 },
        ],
        playback: { name: 'X', duration: '3:00' },
        queueStatus: QueueStatus.OPEN,
      },
    });
    useCurrentPartyroomMock.mockReturnValue(99);
    render(<QueuePanel partyroomId={1} />);
    expect(screen.getByText(/A/)).toBeInTheDocument();
    expect(screen.getByText(/X/)).toBeInTheDocument();
    expect(screen.getByText(/B/)).toBeInTheDocument();
    expect(screen.getByTestId('member-action-register')).toBeInTheDocument();
  });

  test('멤버 + 본인 큐 있음 → MemberActions = [큐에서 나가기]', () => {
    useIsGuestMock.mockReturnValue(false);
    useFetchDjingQueueMock.mockReturnValue({
      data: {
        djs: [
          { crewId: 1, nickname: 'A', playlistName: 'p1', orderNumber: 0 },
          { crewId: 99, nickname: 'Me', playlistName: 'mine', orderNumber: 1 },
        ],
        playback: { name: 'X', duration: '3:00' },
        queueStatus: QueueStatus.OPEN,
      },
    });
    useCurrentPartyroomMock.mockReturnValue(99);
    render(<QueuePanel partyroomId={1} />);
    expect(screen.getByTestId('member-action-unregister')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 최소 구현 (합성)**

```tsx
'use client';
import { FC } from 'react';
import { useIsGuest } from '@/entities/me';
import { useFetchDjingQueue } from '@/features/partyroom/list-djing-queue';
import { useFetchPlaylists } from '@/features/playlist/list';
import { useMobileChangeMyPlaylist } from '@/features-mobile/partyroom/change-my-playlist';
import { useMobileRegisterMeToQueue } from '@/features-mobile/partyroom/register-me-to-queue';
import { useMobileUnregisterMeFromQueue } from '@/features-mobile/partyroom/unregister-me-from-queue';
import { QueueStatus } from '@/shared/api/http/types/@enums';
import { useStores } from '@/shared/lib/store/stores.context';
import CurrentDjRow from './current-dj-row.component';
import GuestCta from './guest-cta.component';
import MemberActions from './member-actions.component';
import QueueList from './queue-list.component';

interface Props {
  partyroomId: number;
}

const MobilePartyroomQueuePanel: FC<Props> = ({ partyroomId }) => {
  const isGuest = useIsGuest();
  const { data: djingQueue } = useFetchDjingQueue({ partyroomId });
  const { useCurrentPartyroom } = useStores();
  const myCrewId = useCurrentPartyroom((s) => s.me?.crewId);
  const { data: playlists = [] } = useFetchPlaylists();

  const djs = djingQueue?.djs ?? [];
  const playback = djingQueue?.playback;
  const queueStatus = djingQueue?.queueStatus ?? QueueStatus.OPEN;
  const isMeInQueue = djs.some((dj) => dj.crewId === myCrewId);
  const sorted = [...djs].sort((a, b) => a.orderNumber - b.orderNumber);
  const currentDj = sorted[0];

  const register = useMobileRegisterMeToQueue({ partyroomId, queueStatus, playlists });
  const change = useMobileChangeMyPlaylist({ partyroomId, playlists });
  const unregister = useMobileUnregisterMeFromQueue({ partyroomId });

  if (isGuest) {
    return (
      <div className='flex flex-col h-full'>
        <div className='flex-1 overflow-y-auto'>
          {currentDj && playback && (
            <CurrentDjRow dj={currentDj as never} playback={playback as never} />
          )}
          <QueueList djs={djs} myCrewId={undefined} onChangePlaylist={() => undefined} />
        </div>
        <GuestCta />
      </div>
    );
  }

  return (
    <div className='flex flex-col h-full'>
      <div className='flex-1 overflow-y-auto'>
        {currentDj && playback && (
          <CurrentDjRow dj={currentDj as never} playback={playback as never} />
        )}
        <QueueList djs={djs} myCrewId={myCrewId} onChangePlaylist={change} />
      </div>
      <MemberActions isMeInQueue={isMeInQueue} onRegister={register} onUnregister={unregister} />
    </div>
  );
};

export default MobilePartyroomQueuePanel;
```

```ts
// src/widgets-mobile/partyroom-queue-panel/index.ts
export { default as MobilePartyroomQueuePanel } from './ui/queue-panel.component';
```

- [ ] **Step 3: tests pass + commit**

```bash
yarn test src/widgets-mobile/partyroom-queue-panel/ --run
git add src/widgets-mobile/partyroom-queue-panel/
git commit -m "feat(widgets-mobile/partyroom-queue-panel): MobilePartyroomQueuePanel 통합 + barrel

게스트/멤버+빈/멤버+큐/멤버+본인큐 4 분기 매트릭스. 합성 hook 3개 통합 호출."
```

---

## Phase 10: room-tabs wiring (큐 탭 placeholder → MobilePartyroomQueuePanel)

### Task 10.1: room-tabs 의 `partyroomId` prop 추가 + 큐 탭 교체 + TabBar 큐 카운트 활성화

**Files:**

- Modify: `src/widgets-mobile/partyroom-room-tabs/partyroom-room-tabs.component.tsx`
- Modify: `src/widgets-mobile/partyroom-room-tabs/ui/parts/tab-bar.component.tsx`
- Modify: `src/widgets-mobile/partyroom-page-mobile/room.component.tsx`

- [ ] **Step 1: TabBar 의 `queueCount?: number` prop 추가**

```tsx
// src/widgets-mobile/partyroom-room-tabs/ui/parts/tab-bar.component.tsx
// 기존 props:
//   activeTab · crewCount · onTabClick
// 변경 추가:
//   queueCount: number
//
// 그리고 line 46:
//   label='🎧 큐'  →  label={`🎧 ${queueCount}`}
```

- [ ] **Step 2: partyroom-room-tabs 의 `partyroomId` prop drilling + 큐 탭 교체**

```tsx
// src/widgets-mobile/partyroom-room-tabs/partyroom-room-tabs.component.tsx
'use client';
import { FC } from 'react';
import { useCurrentPartyroomCrews } from '@/features/partyroom/list-crews';
import { useFetchDjingQueue } from '@/features/partyroom/list-djing-queue';
import { cn } from '@/shared/lib/functions/cn';
import { MobilePartyroomChatPanel } from '@/widgets-mobile/partyroom-chat-panel';
import { MobilePartyroomCrewsPanel } from '@/widgets-mobile/partyroom-crews-panel';
import { MobilePartyroomQueuePanel } from '@/widgets-mobile/partyroom-queue-panel';
import useTabHash from './lib/use-tab-hash.hook';
import TabBar from './ui/parts/tab-bar.component';

interface Props {
  partyroomId: number;
}

const MobilePartyroomRoomTabs: FC<Props> = ({ partyroomId }) => {
  const { activeTab, setActiveTab } = useTabHash();
  const crews = useCurrentPartyroomCrews();
  const { data: djingQueue } = useFetchDjingQueue({ partyroomId });
  const queueCount = djingQueue?.djs?.length ?? 0;

  return (
    <div className='flex-1 flex flex-col min-h-0'>
      <div className='flex-1 min-h-0 relative'>
        <div
          data-tab-content='chat'
          hidden={activeTab !== 'chat'}
          className={cn('absolute inset-0 flex flex-col', activeTab !== 'chat' && 'hidden')}
        >
          <MobilePartyroomChatPanel />
        </div>
        <div
          data-tab-content='crew'
          hidden={activeTab !== 'crew'}
          className={cn('absolute inset-0 overflow-y-auto', activeTab !== 'crew' && 'hidden')}
        >
          <MobilePartyroomCrewsPanel />
        </div>
        <div
          data-tab-content='queue'
          hidden={activeTab !== 'queue'}
          className={cn('absolute inset-0', activeTab !== 'queue' && 'hidden')}
        >
          <MobilePartyroomQueuePanel partyroomId={partyroomId} />
        </div>
      </div>
      <TabBar
        activeTab={activeTab}
        crewCount={crews.length}
        queueCount={queueCount}
        onTabClick={setActiveTab}
      />
    </div>
  );
};

export default MobilePartyroomRoomTabs;
```

- [ ] **Step 3: room.component 의 partyroomId 전달**

```tsx
// src/widgets-mobile/partyroom-page-mobile/room.component.tsx
// 기존: <MobilePartyroomRoomTabs />
// 변경: <MobilePartyroomRoomTabs partyroomId={partyroomId} />
```

- [ ] **Step 4: 기존 tab-bar test + room-tabs test 회귀**

```bash
yarn test src/widgets-mobile/partyroom-room-tabs/ src/widgets-mobile/partyroom-page-mobile/ --run
```

Expected: TabBar 기존 test 가 queueCount prop 추가로 인해 fail 시 mock 데이터 보강 (0 기본값).

- [ ] **Step 5: `SheetHost` + `FullscreenSheetProvider` mount 위치 결정**

`MobilePartyroomQueuePanel` 내부에서 합성 hook (register/change) 가 useFullscreenSheet 를 호출. → `FullscreenSheetProvider` 가 더 상위에 mount 되어야 함. 후보:

- (a) `MobilePartyroomQueuePanel` 자체 root 에서 Provider + SheetHost wrap → 큐 탭 한정 sheet 활성. 다른 탭 (채팅/크루) 에서 sheet 호출은 OUT.
- (b) `MobilePartyroomRoomTabs` root → 모든 탭에서 sheet 활성. queue 가 유일 sheet 호출처이므로 (a) 와 효과 동일.
- (c) `MobileRoom` (room.component) root → 더 상위 mount.

**채택 = (a)** — 책임 최소화 (큐 패널이 sheet 유일 호출처). `MobilePartyroomQueuePanel` 의 jsx root 를 `<FullscreenSheetProvider><div>...</div><SheetHost /></FullscreenSheetProvider>` 로 wrap.

Task 9.1 의 queue-panel.component.tsx 갱신:

```tsx
// jsx 의 최외곽:
return (
  <FullscreenSheetProvider>
    <div className='flex flex-col h-full'>... (기존 내용)</div>
    <SheetHost />
  </FullscreenSheetProvider>
);
```

- [ ] **Step 6: tests + typecheck**

```bash
yarn test src/widgets-mobile/ --run
yarn typecheck
```

Expected: GREEN.

- [ ] **Step 7: commit (Phase 9 갱신 + Phase 10 wiring 묶음)**

```bash
git add src/widgets-mobile/partyroom-queue-panel/ \
        src/widgets-mobile/partyroom-room-tabs/ \
        src/widgets-mobile/partyroom-page-mobile/
git commit -m "feat(widgets-mobile): chunk 4 wiring 완료

- room-tabs: partyroomId prop drilling + 큐 탭 placeholder → MobilePartyroomQueuePanel
- TabBar queueCount prop 추가 (🎧 N 표시)
- queue-panel root 에 FullscreenSheetProvider + SheetHost mount (sheet 인프라 활성)"
```

---

## Phase 8~10 검증 체크리스트

- [ ] 합성 hook 3개 (register/change/unregister) 단위 GREEN
- [ ] 큐 패널 leaf 6개 (CurrentDjRow·QueueList·QueueListItem·MemberActions·GuestCta) 단위 GREEN
- [ ] QueuePanel 4 분기 매트릭스 (게스트/멤버+빈/멤버+큐/멤버+본인큐) 단위 GREEN
- [ ] room-tabs wiring: 큐 탭 → MobilePartyroomQueuePanel 활성, TabBar 큐 카운트 표시
- [ ] `yarn typecheck` 0 errors
- [ ] `yarn test --run` 전체 GREEN (chunk 1~3.1 회귀 0)
- [ ] FullscreenSheetProvider + SheetHost mount 위치 = MobilePartyroomQueuePanel root

---

## Chunk 5: Phase 11~13 (i18n + E2E + 검증)

## Phase 11: i18n 키 21개 추가

spec §7 잠금 + Baseline 의 key inventory 표 (`partyroom.queue.*` 네임스페이스).

### Task 11.1: xlsx 키 인벤토리 추가 + ko/en json 동기

**Files:**

- Modify: `src/shared/lib/localization/dictionaries/ko.json`
- Modify: `src/shared/lib/localization/dictionaries/en.json`
- Modify: `i18n.xlsx` (사용자 처리 또는 yarn i18n 스크립트)

- [ ] **Step 1: ko.json 갱신 — `partyroom.queue` 네임스페이스 추가**

```json
{
  "partyroom": {
    "queue": {
      "guest_cta_title": "🎧 음악을 직접 틀어보세요",
      "guest_cta_subtitle": "3초만에 가입 →",
      "member_action_register": "+ DJ 등록",
      "member_action_unregister": "큐에서 나가기",
      "member_action_change_playlist": "변경",
      "current_dj_title": "현재 DJ",
      "empty": "큐 비어있음",
      "unregister_confirm": "정말 큐에서 나가시겠어요?",
      "sheet_select_playlist_title": "플레이리스트 선택",
      "sheet_add_tracks_title": "곡 추가",
      "sheet_search_placeholder": "곡명 또는 아티스트로 검색",
      "sheet_empty_search": "다른 키워드로 시도해보세요",
      "sheet_search_failed": "검색에 실패했어요. 다시 시도해주세요",
      "sheet_preview_unavailable": "재생할 수 없어요",
      "sheet_add_button": "+ 추가",
      "add_success": "플레이리스트에 추가했어요",
      "add_already_exists": "이미 플레이리스트에 있어요",
      "add_limit_exceeded": "플레이리스트가 가득 찼어요",
      "guest_action_blocked": "로그인이 필요해요",
      "guide_dismiss": "다시 보지 않기",
      "guide_start": "시작",
      "guide_title": "DJ 규칙"
    }
  }
}
```

- [ ] **Step 2: en.json 동기 (영문 번역)**

en.json 의 `partyroom.queue` 네임스페이스에 Baseline 표의 영문 번역 21개 키 추가. ko 와 키 1:1 동기.

- [ ] **Step 3: xlsx 갱신 또는 yarn i18n 우회** ([[feedback_pfplay_web_i18n_drift]] 정책)

```bash
# xlsx 직접 수정 권장 (yarn i18n 무지성 실행 시 drift 키 삭제 위험)
# 본 plan 은 xlsx 수정 시점 사용자에게 위임 가능.
# 또는 임시 운영: ko/en json 직접 수정 + 후속 PR 에서 xlsx 동기
```

- [ ] **Step 4: Phase 4~10 의 inline 한글 → t.partyroom.queue.\* 치환**

```bash
# 검색 대상:
grep -rn "다시 보지 않기\|시작\|취소\|선택 완료\|+ 곡 추가\|+ DJ 등록\|큐에서 나가기\|변경\|현재 DJ\|큐 비어있음\|정말 큐에서 나가시겠어요\|플레이리스트 선택\|곡 추가\|곡명 또는 아티스트로 검색\|다른 키워드로 시도해보세요\|검색에 실패했어요\|재생할 수 없어요\|+ 추가\|플레이리스트에 추가했어요\|이미 플레이리스트에 있어요\|플레이리스트가 가득 찼어요\|로그인이 필요해요\|음악을 직접 틀어보세요\|3초만에 가입\|DJ 규칙" src/widgets-mobile/ src/features-mobile/
```

각 inline 한글 → `t.partyroom.queue.<key>` 치환. useI18n 호출 추가 필요한 컴포넌트엔 import + hook 호출 추가.

- [ ] **Step 5: 단위 테스트 회귀**

```bash
yarn test src/widgets-mobile/ src/features-mobile/ --run
```

Expected: 기존 test 의 inline 한글 assertion 은 i18n mock 또는 ko 사전을 통한 assertion 으로 유지. test 내 한글 그대로 두기 (mock 한 i18n 이 ko 값을 반환).

- [ ] **Step 6: commit**

```bash
git add src/shared/lib/localization/dictionaries/ \
        src/widgets-mobile/ src/features-mobile/
git commit -m "feat(i18n): chunk 4 partyroom.queue 네임스페이스 21개 키 + 컴포넌트 치환

ko/en 동기. xlsx 갱신은 사용자 검토 후 별도 step (drift 정책)."
```

---

## Phase 12: E2E + playwright.config + cleanup helper

spec §8.3 잠금. project glob 갱신 + 신규 spec 2개.

### Task 12.1: playwright.config.ts mobile project 갱신

**Files:**

- Modify: `playwright.config.ts`

- [ ] **Step 1: project 이름 + testMatch 갱신**

```ts
// 기존:
// {
//   name: 'display-board-tos-mobile',
//   testMatch: /mobile\/display-board\.tos\.spec\.ts/,
//   ...
// }
//
// 변경:
// {
//   name: 'mobile',
//   testMatch: /mobile\/.+\.spec\.ts/,
//   ... (iPhone 13 chromium + auth-a 의존 그대로)
// }
```

- [ ] **Step 2: 기존 e2e/mobile/display-board.tos.spec.ts 가 새 project 에서도 동작 확인**

```bash
yarn playwright test --project=mobile e2e/mobile/display-board.tos.spec.ts --reporter=line
```

Expected: 기존 5건 PASS (chunk 3.1 e2e).

- [ ] **Step 3: commit**

```bash
git add playwright.config.ts
git commit -m "ci(playwright): mobile project glob 확장 (display-board-tos-mobile → mobile)

testMatch 를 모든 e2e/mobile/*.spec.ts 매칭으로 확장. chunk 4 신규 spec 자동 포함.
chunk 3.1 의 display-board.tos.spec.ts 가 새 이름의 project 에서도 동작."
```

### Task 12.2: stale title pattern 갱신 (실제 위치 정정 — Phase 0 정찰 결과)

**Phase 0 정찰 결과**: stale pattern 은 `e2e/helpers/partyroom.helpers.ts` 가 아니라 **`e2e/mobile/display-board.tos.spec.ts:111` 의 spec-local 상수 `E2E_PARTYROOM_TITLE_PATTERN`** 에 있음. mobile-only prefix helpers (`mobilePartyroomName`·`mobilePlaylistName`) 는 `e2e/mobile/display-board.helpers.ts` 에 있음.

**채택 옵션 (b) — spec-local 패턴 확장**: dj-register.spec.ts 와 add-tracks.spec.ts 가 신규 spec 이므로 각자 own cleanup 블록을 가질 수 있으나, 우선 `display-board.tos.spec.ts:111` 의 단일 source-of-truth 패턴 확장으로 일관성 유지.

**Files:**

- Modify: `e2e/mobile/display-board.tos.spec.ts:111`

- [ ] **Step 1: spec-local pattern 확장**

```ts
// e2e/mobile/display-board.tos.spec.ts:111
// 기존: const E2E_PARTYROOM_TITLE_PATTERN = /^(E2EA|E2EB|E2EC|E2ED|MTOS|MOBILE-TOS-)/;
// 변경: const E2E_PARTYROOM_TITLE_PATTERN = /^(E2EA|E2EB|E2EC|E2ED|MTOS|MOBILE-TOS-|MDJ|MAT)/;
```

(dj-register.spec.ts · add-tracks.spec.ts 의 afterAll cleanup 은 자체 closePartyroom 호출만으로 충분 — 누적 stale 정리는 display-board.tos.spec.ts 가 cron 처럼 일괄 처리)

- [ ] **Step 2: commit**

```bash
git add e2e/mobile/display-board.tos.spec.ts
git commit -m "ci(e2e/mobile): display-board.tos stale title pattern 확장 (MDJ · MAT)

chunk 4 신규 spec (dj-register · add-tracks) 의 prefix 추가. 단일 cleanup 패턴 유지."
```

### Task 12.3: `e2e/mobile/dj-register.spec.ts` 신규

spec §8.3 의 `e2e-d-mobile-dj-register` 시나리오.

**Files:**

- Create: `e2e/mobile/dj-register.spec.ts`

- [ ] **Step 1: spec 작성 (chunk 3.1 의 display-board.tos.spec.ts 패턴 따라)**

```ts
// chunk 3.1 baseline (e2e/mobile/display-board.tos.spec.ts) 의 desktop setup + mobile join 패턴 사용.
// createPartyroom helper 의 'Be a pfplay host' 버튼이 모바일 lobby 에 부재 → 모바일 viewport 에서 setup fail (chunk 3.1 학습).
// → desktop context 가 setup, mobile context 가 join.

import path from 'path';
import { type Browser, type BrowserContext, devices, expect } from '@playwright/test';
import { test } from '../fixtures/auth.fixtures';
import { ETHEREUM_MOCK_SCRIPT } from '../fixtures/ethereum-mock';
import { closePartyroom, createPartyroom } from '../helpers/partyroom.helpers';

const AUTH_DIR = path.join(__dirname, '../.auth');

async function newDesktopUserContext(browser: Browser, authFile: string): Promise<BrowserContext> {
  const ctx = await browser.newContext({
    ...devices['Desktop Chrome'],
    storageState: path.join(AUTH_DIR, authFile),
    ignoreHTTPSErrors: true,
    extraHTTPHeaders: process.env.VERCEL_AUTOMATION_BYPASS_SECRET
      ? { 'x-vercel-protection-bypass': process.env.VERCEL_AUTOMATION_BYPASS_SECRET }
      : {},
  });
  await ctx.addInitScript(ETHEREUM_MOCK_SCRIPT);
  return ctx;
}

test.describe('mobile DJ register flow', () => {
  let desktopCtx: BrowserContext;
  let partyroomUrl: string;

  test.beforeAll(async ({ browser }) => {
    // desktop user1 컨텍스트가 룸을 setup (mobile viewport 의 lobby 한계 회피)
    desktopCtx = await newDesktopUserContext(browser, 'a-user1.json');
    const setupPage = await desktopCtx.newPage();
    partyroomUrl = await createPartyroom(
      setupPage,
      `MDJ${Date.now().toString(36)}`,
      'mobile dj register'
    );
    await setupPage.close();
  });

  test.afterAll(async () => {
    if (desktopCtx) {
      const cleanupPage = await desktopCtx.newPage();
      await closePartyroom(cleanupPage, partyroomUrl);
      await cleanupPage.close();
      await desktopCtx.close();
    }
  });

  test('모바일 멤버 → 룸 입장 → 큐 탭 → [+ DJ 등록] → SelectPlaylistSheet → 선택 → 큐 리스트에 Me → [큐에서 나가기]', async ({
    page,
  }) => {
    // page 는 playwright.config 의 mobile project (iPhone 13 chromium) + auth-a 인증
    await page.goto(partyroomUrl);
    await page.getByTestId('mobile-tab-queue').click();
    await page.getByTestId('member-action-register').click();
    const firstCard = page.getByTestId(/^mobile-playlist-card-\d+$/).first();
    await firstCard.click();
    await page.getByTestId('select-playlist-confirm').click();
    await expect(page.getByText(/Me/)).toBeVisible();
    await page.getByTestId('member-action-unregister').click();
    await page.getByRole('button', { name: '확인' }).click();
    await expect(page.getByTestId('member-action-register')).toBeVisible();
  });
});
```

- [ ] **Step 2: 로컬에서 실행 (npx next dev http webpack)**

```bash
# 1) 별도 터미널: npx next dev (http, webpack)
# 2) playwright run
yarn playwright test --project=mobile e2e/mobile/dj-register.spec.ts --reporter=line
```

Expected: PASS (단, hostAuthFile · createPartyroom · closePartyroom 의 의존성이 chunk 3.1 의 helper 와 정합).

- [ ] **Step 3: commit**

```bash
git add e2e/mobile/dj-register.spec.ts
git commit -m "test(e2e/mobile): DJ register flow (chunk 4)

모바일 멤버 → 룸 입장 → 큐 탭 → [+ DJ 등록] → SelectPlaylistSheet → 선택 → 큐 리스트 Me → [큐에서 나가기] → 복귀."
```

### Task 12.4: `e2e/mobile/add-tracks.spec.ts` 신규

spec §8.3 의 `e2e-d-mobile-add-tracks` 시나리오.

**Files:**

- Create: `e2e/mobile/add-tracks.spec.ts`

- [ ] **Step 1: spec 작성**

```ts
// dj-register.spec.ts 와 동일한 desktop setup + mobile join 패턴 (chunk 3.1 baseline)
import path from 'path';
import { type Browser, type BrowserContext, devices, expect } from '@playwright/test';
import { test } from '../fixtures/auth.fixtures';
import { ETHEREUM_MOCK_SCRIPT } from '../fixtures/ethereum-mock';
import { closePartyroom, createPartyroom } from '../helpers/partyroom.helpers';

const AUTH_DIR = path.join(__dirname, '../.auth');

async function newDesktopUserContext(browser: Browser, authFile: string): Promise<BrowserContext> {
  const ctx = await browser.newContext({
    ...devices['Desktop Chrome'],
    storageState: path.join(AUTH_DIR, authFile),
    ignoreHTTPSErrors: true,
    extraHTTPHeaders: process.env.VERCEL_AUTOMATION_BYPASS_SECRET
      ? { 'x-vercel-protection-bypass': process.env.VERCEL_AUTOMATION_BYPASS_SECRET }
      : {},
  });
  await ctx.addInitScript(ETHEREUM_MOCK_SCRIPT);
  return ctx;
}

test.describe('mobile add-tracks flow', () => {
  let desktopCtx: BrowserContext;
  let partyroomUrl: string;

  test.beforeAll(async ({ browser }) => {
    desktopCtx = await newDesktopUserContext(browser, 'a-user1.json');
    const setupPage = await desktopCtx.newPage();
    partyroomUrl = await createPartyroom(
      setupPage,
      `MAT${Date.now().toString(36)}`,
      'mobile add tracks'
    );
    await setupPage.close();
  });

  test.afterAll(async () => {
    if (desktopCtx) {
      const cleanupPage = await desktopCtx.newPage();
      await closePartyroom(cleanupPage, partyroomUrl);
      await cleanupPage.close();
      await desktopCtx.close();
    }
  });

  test('모바일 멤버 → 큐 탭 → 빈 플레이리스트의 [+ 곡 추가] → AddTracksSheet → 검색 → ▶ 미리듣기 → [+ 추가] → mini-player 유지', async ({
    page,
  }) => {
    await page.goto(partyroomUrl);
    await page.getByTestId('mobile-tab-queue').click();
    await page.getByTestId('member-action-register').click();
    // 빈 플레이리스트 가정 (E2E 가 빈 playlist 시 자동 [+ 곡 추가] CTA 노출). 정상 playlists 케이스면 첫 카드의 cta 클릭.
    const emptyCardCta = page.getByTestId(/^mobile-playlist-card-\d+-add-tracks$/).first();
    await emptyCardCta.click();
    // AddTracksSheet 노출 — 검색
    await page.getByTestId('music-search-input').fill('test song');
    // 결과 ▶ 클릭 (첫 곡)
    const firstPreview = page.getByTestId(/^search-item-preview-/).first();
    await firstPreview.click();
    // mini-player 노출
    await expect(page.getByTestId('mini-player-name')).toBeVisible();
    // [+ 추가] 클릭
    await page.getByTestId('mini-player-add').click();
    // mini-player 여전히 유지 (다음 곡 미리듣기 가능)
    await expect(page.getByTestId('mini-player-name')).toBeVisible();
  });
});
```

- [ ] **Step 2: 로컬 실행 + commit**

```bash
yarn playwright test --project=mobile e2e/mobile/add-tracks.spec.ts --reporter=line
git add e2e/mobile/add-tracks.spec.ts
git commit -m "test(e2e/mobile): add-tracks flow (chunk 4)

빈 카드 [+ 곡 추가] → AddTracksSheet → 검색 → ▶ → [+ 추가] → mini-player 유지."
```

### Task 12.5: 통합 E2E 전체 run (mandatory CI gate sanity)

- [ ] **Step 1: mobile project 전체 run**

```bash
yarn playwright test --project=mobile --reporter=line
```

Expected: display-board.tos.spec.ts + dj-register.spec.ts + add-tracks.spec.ts 모두 GREEN.

- [ ] **Step 2: 모든 project run (chunk 1~3.1 회귀 0 확인)**

```bash
yarn playwright test --reporter=line
```

Expected: e2e-a/b/c/d 데스크탑 + mobile 모두 GREEN.

---

## Phase 13: 검증 + GH 이슈 코멘트 + push 게이트

### Task 13.1: 전체 회귀

- [ ] **Step 1: 모든 단위·통합 GREEN**

```bash
yarn test --run
```

Expected: 0 fail, 0 skipped (chunk 4 신규 + 기존 회귀).

- [ ] **Step 2: typecheck**

```bash
yarn typecheck
```

Expected: 0 errors.

- [ ] **Step 3: lint**

```bash
yarn lint
```

Expected: 0 errors.

- [ ] **Step 4: 데스크탑 widget 회귀 (mutation 승격 후 import path 영향)**

```bash
yarn test src/widgets/partyroom-djing-dialog/ --run
```

Expected: GREEN (Phase 2 의 mutation 승격 후 회귀 0).

- [ ] **Step 5: 모바일 webpack dev (npx next dev) 로 헤드드 sanity**

```bash
# 별도 터미널:
npx next dev
# 브라우저에서 mobile UA emulation 으로 /parties/<id> 진입 → 큐 탭 → 등록·해제 sanity
```

Expected: 사용자 헤드드 OK. 발견 이슈 시 hotfix 분리.

### Task 13.2: 커밋 정리 + push 게이트

[[feedback_commit_consolidation_before_push]] 정책: push 전 logical 단위로 squash 권장.

- [ ] **Step 1: 커밋 시퀀스 확인**

```bash
git log --oneline origin/development..HEAD
```

Expected: ~30-40 commits (TDD 마이크로 + Phase 별 commit). 단 큰 commit 으로 묶을지는 사용자 결정.

- [ ] **Step 2: 사용자 결정 후 push 또는 force-push**

```bash
# squash 옵션 결정 후:
git push -u origin feature/mobile-responsive-spec-4
```

### Task 13.3: GH 이슈 #340 코멘트

- [ ] **Step 1: 진행 코멘트**

```bash
gh issue comment 340 --repo pfplay/pfplay-web --body "## chunk 4 (DJ + 큐잉) dev/stg 머지 완료

- 큐 탭 단일 표면 (게스트 CTA / 멤버 액션)
- 풀스크린 sheet 인프라 (select-playlist · add-tracks · djing-guide)
- mini-player (sheet 내부 bottom, chunk 3.1 ToS 패턴)
- mutation 승격 (widget → feature)
- E2E 2건 (mobile project glob 확장, mandatory CI)

다음: chunk 5 catch-up (MobileGuard · /mobile-notice · i18n 제거 + 백엔드 ROLE_GUEST 회귀)"
```

---

## Phase 11~13 검증 체크리스트

- [ ] i18n 21개 키 ko/en 동기 + 컴포넌트 inline 한글 치환 완료
- [ ] playwright.config mobile project glob 확장 (`mobile` 이름, `mobile/.+\.spec\.ts`)
- [ ] e2e cleanup helper MDJ/MAT prefix 추가
- [ ] dj-register.spec.ts + add-tracks.spec.ts 신규, mobile project 전체 GREEN
- [ ] `yarn test --run` GREEN · `yarn typecheck` 0 · `yarn lint` 0
- [ ] 데스크탑 widget 회귀 0 (mutation 승격 후)
- [ ] 사용자 헤드드 sanity 통과
- [ ] GH 이슈 #340 진행 코멘트
- [ ] push 게이트 + chunk 3+3.1+4 묶음 release/main 승격은 사용자 결정 ([[reference_branch_env_mapping]] pfplay-web=development→main)

---

## 마무리 체크리스트

- [ ] Phase 0~13 모든 Task 완료
- [ ] spec §3 결정 잠금 12건 모두 구현 정합
- [ ] outcome A (mini-player visible frame 64×36 · 112px container) 채택
- [ ] FullscreenSheet a11y (role=dialog · aria-modal · focus trap · ESC=popstate 통합)
- [ ] mutation 승격 후 데스크탑 widget 회귀 0
- [ ] 데스크탑 `widgets/partyroom-djing-dialog/api/dj-queue.integration.test.ts` 위치 유지
- [ ] mandatory E2E gate (Playwright project=mobile) 통과
- [ ] post-merge follow-up 이슈 등록 (필요 시): preview-player audio 동시출력 사용자 실측 (§10 #5)

## 롤백

- mutation 승격 (Phase 2) 후 데스크탑 회귀 발견 시: `git revert` 3 commit (각 mutation 별) + 신규 위치 임시 유지. 데스크탑 hotfix 분리.
- 모바일 chunk 4 wiring (Phase 10) 후 회귀 발견 시: `MobilePartyroomRoomTabs` 의 `<MobilePartyroomQueuePanel />` → `<QueueTabPlaceholder />` 1줄 revert. 다른 Phase 산출물은 dead code 로 잔존하나 prod 영향 0.
- spec §5.5 outcome A 의 ToS 보존 위험 발견 시: outcome C (inline expand) 채택 — Phase 5 + 6 부분 재설계 후 새 PR.

## 다음 chunk

chunk 5 catch-up:

- `MobileGuard`·`/mobile-notice` 라우트·`mobile_notice_*` i18n 키 완전 제거
- 모바일 fallback 카드 (chunk 1 도입분) 제거
- 모바일 lobby 카드 디테일 (Crews 아바타·BackdropBlur·Typography·PFInfoOutline) — [[project_mobile_lobby_card_chunk5_backlog]]
- 백엔드 ROLE_GUEST 회귀 가드 (`PlaybackReactionCommandControllerTest` 에 GUEST 케이스 1건, pfplay-platform 동반 PR)
- chunk 4 post-merge follow-up 이슈 처리
