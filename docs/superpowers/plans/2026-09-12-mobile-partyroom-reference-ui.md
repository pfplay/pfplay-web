# Mobile Partyroom Reference UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the mobile partyroom room and DJ registration flow to match the supplied reference screens while preserving existing realtime and API behavior.

**Architecture:** Keep playback/query/mutation hooks in their existing feature boundaries. Replace the mobile room shell with a full-viewport background composition, move chat into an overlay card with local compact/expanded state, and use the existing history-backed fullscreen sheet provider for Now DJing and music search. Keep playlist registration and management in the current mobile sheet flow.

**Tech Stack:** Next.js 14, React 18, TypeScript, Tailwind utility classes, Vitest, Testing Library, existing Zustand/React Query hooks.

---

### Task 1: Lock the mobile room state contracts with tests

**Files:**

- Modify: `src/widgets-mobile/partyroom-chat-panel/partyroom-chat-panel.component.test.tsx`
- Modify: `src/widgets-mobile/partyroom-display-board/partyroom-display-board.component.test.tsx`
- Create: `src/widgets-mobile/partyroom-page-mobile/mobile-room-action-bar.component.test.tsx`

- [ ] **Step 1: Add chat state test cases**

  Extend the existing mobile chat test suite so it asserts:

  ```tsx
  render(<MobilePartyroomChatPanel />);
  expect(screen.getByTestId('mobile-chat-panel')).toHaveAttribute('data-expanded', 'false');

  fireEvent.focus(screen.getByTestId('chat-message-input'));
  expect(screen.getByTestId('mobile-chat-panel')).toHaveAttribute('data-expanded', 'true');
  expect(screen.getByTestId('mobile-chat-close')).toBeTruthy();

  fireEvent.click(screen.getByTestId('mobile-chat-close'));
  expect(screen.getByTestId('mobile-chat-panel')).toHaveAttribute('data-expanded', 'false');
  ```

- [ ] **Step 2: Add action bar contract tests**

  Mock the router and action callbacks, render the new action bar, and assert four buttons are present with accessible labels `내 프로필`, `플레이리스트`, `DJ 대기열`, and `공유하기`; clicking the DJ queue button calls `onOpenQueue`.

- [ ] **Step 3: Run the focused tests and verify the new assertions fail**

  Run:

  ```bash
  yarn vitest run src/widgets-mobile/partyroom-chat-panel/partyroom-chat-panel.component.test.tsx src/widgets-mobile/partyroom-page-mobile/mobile-room-action-bar.component.test.tsx
  ```

  Expected: existing chat tests pass, while the new data attributes/component test fail because the implementation is not present yet.

### Task 2: Implement the reference-aligned Main Stage shell

**Files:**

- Create: `src/widgets-mobile/partyroom-page-mobile/mobile-room-action-bar.component.tsx`
- Modify: `src/widgets-mobile/partyroom-page-mobile/room.component.tsx`
- Modify: `src/widgets-mobile/partyroom-display-board/partyroom-display-board.component.tsx`
- Modify: `src/widgets-mobile/partyroom-display-board/ui/parts/blank-placeholder.component.tsx`
- Modify: `src/widgets-mobile/partyroom-display-board/ui/parts/video-frame.component.tsx`

- [ ] **Step 1: Add the bottom action bar**

  Create a presentational component with this interface:

  ```tsx
  type Props = {
    onOpenQueue: () => void;
  };
  ```

  Render a fixed/absolute safe-area-aware translucent pill with four equal buttons. Reuse existing PF icons for profile, playlist, headset, and link; keep profile/playlist/share callbacks as no-op visual actions until their existing routes are wired, and make the DJ queue button call `onOpenQueue`.

- [ ] **Step 2: Recompose `MobileRoom`**

  Wrap the room in `FullscreenSheetProvider`, remove the old three-tab container from the visible mobile room composition, and render:

  ```tsx
  <main className='relative min-h-[100dvh] overflow-hidden bg-black bg-partyRoom bg-cover bg-center'>
    <div className='absolute inset-0 bg-black/45' />
    <div className='relative z-10 flex min-h-[100dvh] flex-col'>
      <MobilePartyroomDisplayBoard partyroomId={partyroomId} />
      <MobilePartyroomChatPanel />
      <MobileRoomActionBar onOpenQueue={openNowDjing} />
    </div>
    <SheetHost />
  </main>
  ```

  Preserve the existing `useTabHash`/room-tab exports for isolated tests and non-reference consumers, but do not render the old tab bar in the new room shell.

- [ ] **Step 3: Match the display board layout**

  Make the header transparent/overlayed, use title `Main Stage` from the existing summary fallback, show the crew count from the current partyroom store, and keep back navigation to `/parties`. Remove the `sticky`, border, and padded video shell styles from the room-level board. Keep the YouTube player and autoplay gate behavior unchanged.

- [ ] **Step 4: Match the empty playback state**

  Render the PFPlay wordmark asset `/images/Logo/wordmark_medium_white.png` above the two-line Korean empty copy. Keep the `data-testid='blank-placeholder'` contract.

- [ ] **Step 5: Run focused display and action tests**

  Run:

  ```bash
  yarn vitest run src/widgets-mobile/partyroom-display-board/partyroom-display-board.component.test.tsx src/widgets-mobile/partyroom-page-mobile/mobile-room-action-bar.component.test.tsx
  ```

  Expected: all focused tests pass, including full-width video and autoplay gate invariants.

### Task 3: Add compact/expanded mobile chat overlay behavior

**Files:**

- Modify: `src/widgets-mobile/partyroom-chat-panel/partyroom-chat-panel.component.tsx`
- Modify: `src/widgets-mobile/partyroom-chat-panel/ui/parts/chat-item.component.tsx`
- Modify: `src/widgets-mobile/partyroom-chat-panel/partyroom-chat-panel.component.test.tsx`

- [ ] **Step 1: Add local expansion state**

  Add `const [expanded, setExpanded] = useState(false)` and set it on `onFocus` and `onClick` of the chat input. The close button must call `setExpanded(false)` and retain the current draft.

- [ ] **Step 2: Render reference card structure**

  Add `data-testid='mobile-chat-panel'`, `data-expanded={expanded}`, and a header with `실시간 채팅`. Render the close button only when expanded. In compact mode show at most the latest visible user message plus input; in expanded mode render the scrollable message list and fixed input row. Keep system/playback-summary/blocked message filtering exactly as it is.

- [ ] **Step 3: Apply overlay positioning**

  Use a room-relative absolute card above the bottom action bar: compact mode around `bottom-[96px]`, expanded mode from the video/notice area down to the safe-area bottom. Use `transition-[height,top]`, a black surface, gray border, and reference spacing. Do not introduce a second scroll container around the input.

- [ ] **Step 4: Run chat tests**

  Run:

  ```bash
  yarn vitest run src/widgets-mobile/partyroom-chat-panel/partyroom-chat-panel.component.test.tsx
  ```

  Expected: message filtering, send, compact, expansion, and close tests pass.

### Task 4: Build reference-aligned Now DJing and track-search sheets

**Files:**

- Create: `src/widgets-mobile/partyroom-djing-sheet/ui/now-djing-sheet.component.tsx`
- Create: `src/widgets-mobile/partyroom-djing-sheet/ui/register-track-sheet.component.tsx`
- Create: `src/widgets-mobile/partyroom-djing-sheet/ui/register-track-sheet.component.test.tsx`
- Modify: `src/widgets-mobile/partyroom-djing-sheet/ui/sheet-host.component.tsx`
- Modify: `src/widgets-mobile/partyroom-djing-sheet/ui/fullscreen-sheet.component.tsx`
- Modify: `src/widgets-mobile/partyroom-djing-sheet/index.ts`
- Modify: `src/widgets-mobile/partyroom-page-mobile/room.component.tsx`

- [ ] **Step 1: Add the Now DJing sheet**

  Create a fullscreen body matching Image #4: close icon/title, centered empty message, notice banner above two full-width actions. The primary action pushes `register-track` with title `곡 선택`; the secondary action invokes the existing mobile playlist registration hook (`useMobileRegisterMeToQueue`) with the current partyroom queue status and playlists.

- [ ] **Step 2: Add the track search sheet**

  Compose the shared `MusicSearch` with `mode='dj-registration'`, `selectedVideoId`, and `onSelect`. The shared component owns `useSearchMusics(search)` and renders a controlled search field, centered empty state when no query exists, and rows with `thumbnailUrl`, decoded title, and `runningTime`. `RegisterTrackSheet` owns the selected `Music`, calls `useQuickRegisterMeToQueue()` with `partyroomId`, `name`, `linkId`, `duration`, and `thumbnailImage`, then closes the sheet programmatically on success.

- [ ] **Step 3: Add sheet tests before implementation completion**

  Cover:

  ```tsx
  expect(screen.getByText('디제잉할 곡을 검색하세요.')).toBeTruthy();
  await userEvent.type(screen.getByTestId('register-track-search-input'), 'Shut Down');
  await userEvent.click(screen.getByTestId('register-track-item-v2'));
  expect(screen.getByTestId('register-track-submit')).not.toBeDisabled();
  ```

  Also assert the mutation payload includes the selected `Music` fields and the close callback is invoked after success.

- [ ] **Step 4: Update fullscreen sheet chrome**

  Keep role/aria/body-scroll-lock/focus behavior, but add reference sizing hooks: safe-area top, taller header, 24px title, 32px side padding, no default bottom border, and optional footer border. Keep current `data-testid='fullscreen-sheet-close'` and `data-testid='fullscreen-sheet-back'` selectors.

- [ ] **Step 5: Run sheet tests**

  Run:

  ```bash
  yarn vitest run src/widgets-mobile/partyroom-djing-sheet src/features-mobile/partyroom/select-playlist-for-djing
  ```

  Expected: existing history/keyboard/focus tests and new Now DJing/search tests pass.

### Task 5: Match music-search rows and bottom registration CTA

**Files:**

- Modify: `src/features-mobile/playlist/add-tracks/ui/music-search.component.tsx`
- Modify: `src/features-mobile/playlist/add-tracks/ui/search-list-item.component.tsx`
- Modify: `src/features-mobile/playlist/add-tracks/ui/music-search.component.test.tsx`
- Modify: `src/features-mobile/playlist/add-tracks/ui/search-list-item.component.test.tsx`

- [ ] **Step 1: Style the search field and result container**

  Reuse the shared `Input`, but add the reference dark-gray 48px field, large search icon, left/right 32px padding, and black result surface. Preserve the existing query state, loading/error/empty branches, and API hook.

- [ ] **Step 2: Style result rows**

  Change rows to reference spacing: 80px-ish thumbnail, two-line title, duration aligned to the right, no preview/add icon buttons in the DJ registration sheet. Keep the existing preview/add actions for playlist-management consumers by introducing an optional `mode?: 'playlist' | 'dj-registration'` prop with `'playlist'` as the default.

- [ ] **Step 3: Verify search behavior**

  Run:

  ```bash
  yarn vitest run src/features-mobile/playlist/add-tracks/ui/music-search.component.test.tsx src/features-mobile/playlist/add-tracks/ui/search-list-item.component.test.tsx
  ```

  Expected: existing preview/add tests pass with default mode, and DJ mode renders a selectable row without breaking decoded titles or thumbnails.

### Task 6: Full validation and visual smoke test

**Files:**

- Modify: any files needed to fix validation failures only.

- [ ] **Step 1: Run the full mobile test slice**

  ```bash
  yarn vitest run src/widgets-mobile src/features-mobile/partyroom src/features-mobile/playlist/add-tracks
  ```

- [ ] **Step 2: Run typecheck and lint**

  ```bash
  yarn test:type
  yarn lint
  ```

- [ ] **Step 3: Run the production build**

  ```bash
  yarn build
  ```

- [ ] **Step 4: Inspect the live mobile flow**

  At a 390px portrait viewport, verify empty Main Stage, active playback, compact chat, expanded chat with close, Now DJing, empty `곡 선택`, search results, selected result, and fixed bottom registration CTA. Record any environment-only gap rather than claiming visual completion without evidence.

- [ ] **Step 5: Review the final diff**

  ```bash
  git status --short
  git diff --check
  git diff --stat
  ```

  Confirm no desktop files or unrelated generated files changed.
