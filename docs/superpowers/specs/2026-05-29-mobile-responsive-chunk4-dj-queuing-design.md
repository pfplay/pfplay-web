# 모바일 반응형 — Chunk 4 (DJ + 큐잉) Design Spec

**Date:** 2026-05-29
**Chunk:** chunk 4 (5-chunk 시리즈 4번째, chunk 3.1 완료 직후)
**Status:** Draft v4 (reviewer 3차 minor 2 issues + 3 recs sweep) → 사용자 승인 → writing-plans
**선행:** [`2026-05-22-mobile-responsive-scope-design.md`](./2026-05-22-mobile-responsive-scope-design.md) · [`2026-05-28-mobile-responsive-architecture-design.md`](./2026-05-28-mobile-responsive-architecture-design.md) · [`2026-05-29-mobile-display-board-tos-redesign.md`](./2026-05-29-mobile-display-board-tos-redesign.md)

## 1. Goal

pfplay-web 모바일 반응형 5-chunk 시리즈의 **Chunk 4 — DJ + 큐잉** 구현. chunk 3 의 룸 탭 컨테이너 위에 (1) **큐 탭 콘텐츠** + (2) **DJ 등록·플레이리스트 변경·해제 흐름** + (3) **곡 추가 검색 + 미리듣기 (add-tracks)** 를 얹는다. chunk 5 catch-up (`/mobile-notice`·MobileGuard·i18n 제거 + E2E 마무리 + 백엔드 ROLE_GUEST 회귀) 전 마지막 큰 피처 chunk.

**모바일 게이트 라인의 결정적 미끼** — 스코프 #340 §2 "참여 깊이 = DJ 포함 (풀 참여)". chunk 4 가 모바일 멤버에게 "직접 음악을 틀 수 있다" 를 처음으로 보여주는 표면이다.

## 2. 배경: chunk 시리즈에서의 위치

architecture spec (`2026-05-28-mobile-responsive-architecture-design.md`) §3.3 의 chunk 4 정의:

- `widgets-mobile/partyroom-djing-dialog` 풀스크린 sheet
- `widgets-mobile/music-preview-player` 좁은화면 변형
- `features-mobile/playlist/add-tracks` 검색→프리뷰→큐 흐름
- `features-mobile/partyroom/select-playlist-for-djing` 모바일 셀렉터
- 큐 탭 콘텐츠 (게스트 → 로그인 CTA / 멤버 → 액션)
- grab + DJ 등록 동작

§4.4 큐 탭 wireframe (잠금):

```
[멤버, 등록 전]                  [게스트]
├─ DJ 큐 ───────────────┤        ├─ DJ 큐 ───────────────┤
│ 1. Nick — Playlist A   │        │ 1. Nick — Playlist A   │
│ 2. Nick — Playlist B   │        │ 2. Nick — Playlist B   │
│ 3. (대기 슬롯)          │        │ ────────────────────── │
│ ────────────────────── │        │ 🎧 음악을 직접 틀어보세요│
│  ▾ 내 플레이리스트 선택  │        │   3초만에 가입 →        │
│  [ + DJ 등록 ]         │        └────────────────────────┘
└────────────────────────┘
```

## 3. 결정 잠금 (brainstorming 산출물, 2026-05-29)

| #   | 결정                                        | 값                                                                                                                                                              |
| --- | ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | 큐 탭 ↔ sheet 분리                         | **큐 탭 단일 표면**. djing-dialog 풀스크린 sheet 컴포넌트 자체 제거(=큐 탭 콘텐츠에 흡수). 셀렉터·add-tracks·djing-guide 만 sheet                               |
| 2   | sheet 패턴 일관성                           | **풀스크린 sheet 통일**. 헤더(× or ←·제목) + body + footer 슬롯. bottom sheet 도입 안 함                                                                        |
| 3   | add-tracks preview-player 위치              | **sheet 내부 bottom mini-player**. chunk 3.1 ToS 보존 패턴 (wrapper 유지·`loadVideoById`) 재사용                                                                |
| 4   | useDjingGuide 처리                          | **풀스크린 sheet 변형**. 데스크탑 w-[596px] dialog 의 모바일 사본. djingGuideHidden preference 존중                                                             |
| 5   | 게스트 큐 탭 로그인 CTA                     | **단순 `/sign-in` 라우팅**. `next=` 쿼리 패턴 도입은 별건 (chunk 4 OUT scope)                                                                                   |
| 6   | grab 동작                                   | **chunk 2/3.1 에서 이미 wiring** (`widgets-mobile/partyroom-display-board/ui/parts/action-buttons`). chunk 4 에선 sanity 확인만                                 |
| 7   | 격리 패턴                                   | **C3 격리 sibling 사본** (chunk 2/3 동일). store 레이어 (`useMusicPreview`·`useUserPreferenceStore`·queries) 만 공유                                            |
| 8   | mutation api 위치                           | **`features/partyroom/<action>` 으로 승격** (widget 사적 api → feature 공개 api). 데스크탑 widget import path 1줄 변경, 동작 0                                  |
| 9   | alert/confirm dialog                        | **데스크탑 `useDialog` 재사용** (큐 락·등록 해제 confirm·곡 추가 안내). shared 컴포넌트라 cross-import 위배 없음                                                |
| 10  | 빈 플레이리스트 (`playlists.length===0`)    | confirm dialog → `router.push('/me/playlist')` → middleware 가 데스크탑 전용 라우트 매치 → `MobileOnlyDesktopFeatureCard` 노출 (§architecture 2.4)              |
| 11  | 빈 곡 플레이리스트 (`every musicCount===0`) | SelectPlaylistSheet 노출 + 각 카드에 "곡 추가" CTA → AddTracksSheet 진입 (분기 명시)                                                                            |
| 12  | sheet 스택                                  | `history.pushState` 기반 self-managed stack. hash tab sync (chunk 3) 와 직교. push/pop dedup. ESC 키 = popstate 와 동일 시맨틱 (스택 1개면 close, 다중이면 pop) |

## 4. Architecture

### 4.1 디렉터리 구조 (신규/수정)

```
src/
├── widgets-mobile/
│   ├── partyroom-room-tabs/                    (chunk 3 기존, 큐 탭 wiring 수정)
│   │   └── ui/partyroom-room-tabs.component.tsx
│   │       └── 큐 탭 placeholder ("곧 출시") → MobilePartyroomQueuePanel 로 교체
│   │
│   ├── partyroom-queue-panel/                  ⭐ 신규 (큐 탭 단일 표면)
│   │   ├── index.ts
│   │   ├── ui/
│   │   │   ├── queue-panel.component.tsx       — 게스트/멤버 분기 (useIsGuest)
│   │   │   ├── current-dj-row.component.tsx    — 현재 DJ + playback 메타 (Skip OUT)
│   │   │   ├── queue-list.component.tsx        — 큐 순서 스크롤 리스트
│   │   │   ├── queue-list-item.component.tsx   — DJ + 플레이리스트명, Me = ChangePlaylist 트리거
│   │   │   ├── member-actions.component.tsx    — sticky bottom: [+ DJ 등록] / [큐에서 나가기]
│   │   │   └── guest-cta.component.tsx         — 로그인 CTA 카드 → /sign-in
│   │   └── (lib 신규 도입 0 — props drilling 으로 충분, §5.1 참조)
│   │
│   ├── partyroom-djing-sheet/                  ⭐ 신규 (sheet 인프라 + DJ 전용 sheet 들)
│   │   ├── index.ts
│   │   ├── ui/
│   │   │   ├── fullscreen-sheet.component.tsx  — 공용: header + body slot + footer slot + back/close
│   │   │   ├── select-playlist-sheet.component.tsx
│   │   │   ├── add-tracks-sheet.component.tsx
│   │   │   └── djing-guide-sheet.component.tsx
│   │   └── lib/
│   │       └── use-fullscreen-sheet.hook.tsx   — open/close + history.pushState 스택 + popstate/ESC 통합
│   │
│   └── music-preview-mini-player/              ⭐ 신규 (sheet 내부 bottom)
│       ├── index.ts
│       └── ui/
│           └── mini-player.component.tsx       — useMusicPreview 공유, position='mobile-bottom'
│
├── features-mobile/
│   ├── partyroom/
│   │   ├── list/                                (chunk 2 기존)
│   │   ├── select-playlist-for-djing/          ⭐ 신규
│   │   │   ├── index.ts
│   │   │   └── ui/
│   │   │       ├── select-playlist.component.tsx        — 플레이리스트 카드 리스트
│   │   │       └── use-mobile-select-playlist.hook.tsx  — Promise<Playlist | void> contract
│   │   ├── register-me-to-queue/               ⭐ 신규 (UI hook 만, mutation 은 features/ 로 승격)
│   │   │   └── ui/use-register-me-to-queue.hook.tsx
│   │   ├── change-my-playlist/                 ⭐ 신규
│   │   │   └── ui/use-change-my-playlist.hook.tsx
│   │   └── unregister-me-from-queue/           ⭐ 신규
│   │       └── ui/use-unregister-me-from-queue.hook.tsx
│   │
│   └── playlist/
│       ├── add-tracks/                          ⭐ 신규
│       │   ├── index.ts
│       │   └── ui/
│       │       ├── add-tracks-trigger.component.tsx     — sheet open 진입점 (SelectPlaylistSheet 안)
│       │       ├── music-search.component.tsx           — 검색 input + 결과 리스트
│       │       └── search-list-item.component.tsx       — 곡 1개. ▶ → preview start
│       └── djing-guide/                         ⭐ 신규
│           └── ui/
│               ├── use-mobile-djing-guide.hook.tsx     — preference + sheet 트리거
│               └── guide-layout.component.tsx           — 모바일 stacking 변형
│
├── features/partyroom/
│   ├── register-me-to-queue/                    ⭐ mutation 승격 (widget → feature)
│   │   ├── index.ts
│   │   └── api/use-register-me-to-queue.mutation.ts
│   ├── change-my-playlist/                      ⭐ mutation 승격
│   │   ├── index.ts
│   │   └── api/use-change-my-playlist.mutation.ts
│   └── unregister-me-from-queue/                ⭐ mutation 승격
│       ├── index.ts
│       └── api/use-unregister-me-from-queue.mutation.ts
│
├── widgets/partyroom-djing-dialog/              데스크탑 ※ import path 1줄 변경만
│   └── ui/register-button.component.tsx        — '../api/use-register-me-to-queue.mutation'
│                                                 → '@/features/partyroom/register-me-to-queue'
│   (change-playlist-button, unregister-button 동일 패턴)
│
└── 그 외 데스크탑 트리                          0 수정
```

### 4.2 외부 의존 (재사용·공유)

| 의존                                               | 종류                                     | 재사용 형태                                                                                                                                                                                                                      |
| -------------------------------------------------- | ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useFetchDjingQueue`                               | features/partyroom/list-djing-queue      | ✅ 그대로 (큐 데이터 단일 소스)                                                                                                                                                                                                  |
| `useFetchPlaylists`                                | features/playlist/list                   | ✅ 그대로                                                                                                                                                                                                                        |
| `useSearchMusics`                                  | features/playlist/add-tracks/api         | ✅ 그대로                                                                                                                                                                                                                        |
| `useAddPlaylistTrack`                              | features/playlist/add-tracks/api         | ✅ 그대로                                                                                                                                                                                                                        |
| `useGrabCurrentPlayback`                           | features/partyroom/grab-current-playback | ✅ chunk 2/3.1 wiring 유지                                                                                                                                                                                                       |
| `useMusicPreview` store                            | shared/lib/store                         | ✅ 공유 (preview SoT)                                                                                                                                                                                                            |
| `useUserPreferenceStore` (djingGuideHidden)        | entities/preference                      | ✅ 공유                                                                                                                                                                                                                          |
| `useIsGuest`                                       | entities/me                              | ✅ 공유                                                                                                                                                                                                                          |
| `useDialog` (alert/confirm)                        | shared/ui/components/dialog              | ✅ 공유 (alert 1줄 메시지에 풀스크린 부적합). useDialog 가 내부에서 mount 하는 데스크탑 Dialog 컴포넌트가 모바일 viewport 에서 그대로 노출됨 (centered, max-w 자연 fit). 모바일 별도 visual 디자인 0 — §10 #4 acceptance 로 검증 |
| `useStores().useCurrentPartyroom(s=>s.me?.crewId)` | shared/lib/store                         | ✅ 공유                                                                                                                                                                                                                          |
| `PlaylistActionBypassProvider`·`usePlaylistAction` | entities/playlist                        | ✅ 공유                                                                                                                                                                                                                          |
| `Tooltip`                                          | shared/ui/components/tooltip             | ❌ aria-label 로 대체 (chunk 3 정책)                                                                                                                                                                                             |
| `Dialog`                                           | shared/ui/components/dialog              | ❌ 모바일 FullscreenSheet 자체 컴포넌트 (alert/confirm 한정 useDialog 만 재사용)                                                                                                                                                 |

**FSD 컨벤션 노트** — `features-mobile/partyroom/{register-me-to-queue,change-my-playlist,unregister-me-from-queue}/ui/use-*.hook.tsx` 는 hook-only segment (컴포넌트 0). FSD 의 `ui/` segment 컨벤션 약한 위반 (보통 컴포넌트가 들어가는 자리에 hook 만). **수용 사유**: 데스크탑 `widgets/partyroom-djing-dialog/ui/<action>-button.component.tsx` 가 컴포넌트 + 조합 로직 (`useMobileSelectPlaylist` × mutation × djingGuide) 을 일체화한 패턴을 모바일에서 _컴포넌트 (`member-actions` · `queue-list-item`) ↔ 합성 hook_ 으로 분해. 합성 hook 위치는 features-mobile 하위 자연 — 데스크탑 패턴 1:1 매칭 유지. React 생태계에서 `use-*` 가 ui 부수 기능으로 다뤄지는 관행 정합.

### 4.3 RSC ↔ Client 경계

전부 client tree. `widgets-mobile/partyroom-queue-panel/ui/queue-panel.component.tsx` 부터 `'use client'`. 상위는 chunk 1 의 `MobileRoom` 이 이미 client.

## 5. 컴포넌트 책임

### 5.1 MobilePartyroomQueuePanel

**입력**: `partyroomId: number` props (chunk 2 의 `room.component.tsx` → `MobilePartyroomRoomTabs` 가 chunk 3 에서 받아 chunk 4 가 `MobilePartyroomQueuePanel` 로 전달). 큐 데이터·me crewId 는 panel 내부 호출. context 신규 도입 없음 (단순 props drilling — 3단 깊이라 prop 만으로 충분).

내부에서 `useFetchDjingQueue` + `useIsGuest` + `useCurrentPartyroom(s=>s.me?.crewId)` 호출.

**렌더 분기**:

1. `isGuest` → `<GuestCta />` 만 (큐 리스트도 함께 노출, 액션 영역만 CTA)
2. `!isGuest && !djingQueue.djs.length` → `<EmptyMember />` (등록 버튼만)
3. `!isGuest && djingQueue.djs.length` → `<CurrentDjRow />` + `<QueueList />` + `<MemberActions />`

**isMeInQueue** = `djs.some(dj => dj.crewId === myCrewId)`. MemberActions 가 이 플래그로 등록/해제 토글.

### 5.2 FullscreenSheet (공용 인프라)

데스크탑 `Dialog` 와 별도 컴포넌트. props:

- `open: boolean`
- `title?: string`
- `onClose: () => void`
- `onBack?: () => void` (sheet 스택 내 prev 가 있으면 ← 노출, 아니면 ×)
- `children: ReactNode` (body slot)
- `footer?: ReactNode` (sticky bottom slot — 예: select-playlist 의 [취소·완료], add-tracks 의 mini-player)

**렌더**: 전체 화면 fixed inset-0, header sticky-top, body scrollable, footer sticky-bottom. z-index 는 모달 layer (탭바보다 위).

**a11y 가드** (데스크탑 `Dialog` 동일 패턴):

- `role="dialog"` · `aria-modal="true"` · `aria-labelledby={titleId}` (title 있을 때)
- focus trap (sheet open 시 첫 포커스 = ×/← 버튼 또는 title, sheet close 시 트리거 버튼 복귀)
- ESC 키 → `onBack ?? onClose` 호출 (sheet 스택의 popstate 와 동일 시맨틱 — 스택 1개면 close, 다중이면 pop)
- body scroll lock (sheet open 동안 본문 스크롤 차단)
- `useFullscreenSheet.hook` 의 popstate listener 와 ESC handler 가 같은 pop 함수 호출 (중복 분기 회피)

### 5.3 useFullscreenSheet hook

스택 자체 관리:

```ts
type SheetKey = 'select-playlist' | 'add-tracks' | 'djing-guide' | string;

interface SheetEntry {
  key: SheetKey;
  node: ReactNode;
  onClose?: () => void;
}

interface FullscreenSheetController {
  push(entry: SheetEntry): void;
  pop(): void;
  closeAll(): void;
  stack: SheetEntry[];
}
```

- push: `history.pushState({ sheetKey: entry.key }, '')` + 스택 push. 같은 key 중복 push 시 dedup
- popstate listener: 스택 비어있지 않으면 pop, 비어있으면 라우터에 위임
- closeAll: 각 entry 의 onClose 호출 후 history.go(-stack.length)
- unmount 시 listener cleanup

### 5.4 useMobileSelectPlaylist hook

데스크탑 `useSelectPlaylist` 의 모바일 사본. 동일 contract `() => Promise<Playlist | void>`:

```ts
const selectPlaylist = useMobileSelectPlaylist({ playlists });
const selected = await selectPlaylist();
if (!selected) return; // canceled
// use selected
```

**데스크탑 hook 의존 중 모바일에서 제거되는 항목** (drawer 의존 0):

| 데스크탑 의존                                             | 모바일 처리                                                                                                                                                                                                                                                                                                             |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `setPlaylistDrawer({ open, zIndex })` (라이브러리 drawer) | router.push('/me/playlist') — drawer 없음                                                                                                                                                                                                                                                                               |
| `playlistDrawerWithSelectPlaylist` (drawer 갱신·미리보기) | SelectPlaylistSheet 가 미리보기 없이 카드만 노출 (drawer 0)                                                                                                                                                                                                                                                             |
| `closePlaylistDrawer` (cancel/confirm 정리)               | sheet close 만 (drawer 정리 불필요)                                                                                                                                                                                                                                                                                     |
| `useDidMountEffect(closePlaylistDrawer)`                  | 제거 (이전 drawer 상태 자체 없음)                                                                                                                                                                                                                                                                                       |
| `guidePrepareSelect` (빈/곡없음 단일 confirm 분기)        | **두 분기 분리** — `playlists=[]` = confirm → `/me/playlist`, `every musicCount===0` = SelectPlaylistSheet + 빈 곡 카드 CTA. 모바일은 PlaylistDrawer 가 없어 데스크탑의 "곡 추가 안내 → drawer open" 단일 분기로 묶기 부적합 (drawer 진입 후 자유로운 라이브러리 조작이 가능한 데스크탑과 달리 모바일은 라이브러리 OUT) |

→ 모바일 hook 의 의존은 `useDialog().openConfirmDialog` + `useFullscreenSheet().push(SelectPlaylistSheet)` + `useRouter()` 셋만. UIState 의 `playlistDrawer` 는 모바일 트리에서 접근하지 않음.

내부 분기:

- `playlists.length === 0` → confirm dialog → confirm 시 `router.push('/me/playlist')` → resolve(undefined)
- `playlists.every(p => p.musicCount === 0)` → SelectPlaylistSheet push, 카드에 "곡 추가" CTA 노출
- 정상 → SelectPlaylistSheet push, 카드 선택 → resolve(playlist)

### 5.5 MiniPlayer (sheet 내부 bottom)

`PlayerContainer position='mobile-bottom'` 신규 위치 추가 (현 'sidebar'·'modal' 외).

```tsx
function MiniPlayer() {
  const { useMusicPreview } = useStores();
  const { currentTrack, playState, stopPreview } = useMusicPreview();
  if (!currentTrack || playState !== 'playing') return null;

  return (
    <div className='sticky bottom-0 h-[80px] bg-black border-t border-gray-700 flex items-center px-3 gap-3'>
      {/* ⚠ illustration only — 사이즈는 §5.5 spike 분기로 결정 (1×1 hidden 아님) */}
      <YouTubePreviewPlayer width={SIZE.w} height={SIZE.h} />
      <div className='flex-1'>
        <div>{currentTrack.name}</div>
        <div>{currentTrack.artist}</div>
      </div>
      <PlayPauseToggle />
      <AddButton onClick={() => addPlaylistTrack(currentTrack)} />
      <CloseButton onClick={stopPreview} />
    </div>
  );
}
```

**ToS 보존 노트** — chunk 3.1 의 학습 (1×1 hidden = ToS 위반) 은 **룸 메인 재생** 에 적용. 미리듣기 mini-player 는 짧은 임시 재생이라 분리 검토 가능하나, ToS 의 "embedded player 의 일부를 숨겨선 안 된다" 정신은 미리듣기에도 적용된다고 봐야 함.

**§5.5 spike 분기 규칙 (잠금)**:

| spike outcome (plan 단계 결정)            | architecture 분기 (구현)                                                                                                                                       |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **(A) visible frame 채택 (default·권장)** | mini-player 높이 = 80px → 112px (video 64×36 + 16px padding). [추가]·⏯·×·곡명 영역 재배치. 곡명 1줄 ellipsis. video 우측에 배치, 컨트롤 우상단                |
| (B) hidden 유지 + 별도 visible badge      | YouTube 로고/링크 noticeable 영역 추가 (audio-only badge). ToS 준수 마진 약함, **권장 안 함**. plan 검토에서만 채택 가능 (예: YouTube 정책 갱신 확인 후)       |
| (C) 미리듣기 자체 inline 펼침으로 회피    | search-list-item 의 inline expand 로 전환 (Q3 옵션 B 재고). mini-player 폐기, sheet 내 IFrame 1개로 일원화. 큰 재설계라 plan 단계 즉시 결정 시점 (구현 비용 ↑) |

→ **default = (A)**. plan 단계 spike 가 (A) 의 구현 위험 (frame 노출 시 audio quality·UX 영향) 발견 시에만 (C) 로 점프. (B) 는 **사용자 명시 승인 + 결정 이력 추가** 필수 — plan-time 자의 채택 금지.

**SIZE constant 위치** — `mini-player.component.tsx` 내부 local const (`const SIZE = { w: 64, h: 36 }`). spike outcome 확정 시 plan 단계 정의.

### 5.6 SelectPlaylistSheet

플레이리스트 카드 리스트 (각 카드: 썸네일 없음 — `Playlist` 모델에 cover 없음. 이름 + 곡수만). 빈 곡 플레이리스트는 [+ 곡 추가] CTA → AddTracksSheet push. 푸터: [취소] [선택 완료] sticky-bottom.

### 5.7 AddTracksSheet

`PlaylistActionBypassProvider` 로 감싸 `usePlaylistAction` context 주입 (데스크탑 패턴 동일). body = `MusicSearch` (검색 input + 결과 리스트). 푸터 = `MiniPlayer` (currentTrack 있을 때만 렌더).

검색 결과 아이템 `search-list-item.component.tsx`:

- 곡 메타 표시
- ▶ 버튼 → `playlistAction.preview(track)`
- [+] 버튼 → `useAddPlaylistTrack` 직접 호출 (preview 없이 바로 추가도 가능, 데스크탑 패턴 동일)

### 5.8 DjingGuideSheet

데스크탑 `DjingGuideLayout` 를 모바일 stacking 으로 재배치. 각 가이드 카드를 풀폭 1컬럼으로. "다시 보지 않기" 체크박스 → `useUserPreferenceStore.updatePreference({ djingGuideHidden: true })`. [시작] → sheet 닫힘.

## 6. 데이터 흐름

### 6.1 큐 탭 mount

```
MobilePartyroomRoomTabs (chunk 3)
  └─ #queue 활성 → MobilePartyroomQueuePanel mount (탭 hidden 토글, query 항상 enabled)
      ├─ useFetchDjingQueue({ partyroomId }) — polling
      ├─ useIsGuest()
      └─ useStores().useCurrentPartyroom(s => s.me?.crewId)
```

### 6.2 등록 흐름 (멤버, 미등록)

```
[+ DJ 등록] 클릭
  → useMobileSelectPlaylist({ playlists }).select()
      ├─ playlists.length===0 → confirm → /me/playlist
      ├─ all musicCount===0   → SelectPlaylistSheet push, 카드 클릭 → AddTracksSheet push
      └─ 정상 → SelectPlaylistSheet push → 카드 선택 → resolve(playlist)
  → if (selected) {
       registerMeToQueue({ partyroomId, playlistId: selected.id })
       if (showDjingGuide) push DjingGuideSheet
     }
  → mutation onSuccess: useFetchDjingQueue invalidate → 큐 리스트 갱신
```

### 6.3 플레이리스트 변경 (멤버, 등록됨)

```
QueueList 의 Me row → ChangePlaylist 트리거
  → useMobileSelectPlaylist().select() → SelectPlaylistSheet push
  → resolve(playlist) → changeMyPlaylist({ partyroomId, playlistId })
  → onSuccess invalidate
```

### 6.4 큐에서 나가기

```
[큐에서 나가기] 클릭
  → openConfirmDialog
  → confirm → unregisterMeFromQueue({ partyroomId })
  → onSuccess invalidate → MemberActions 가 [+ DJ 등록] 으로 복귀
```

### 6.5 add-tracks 흐름

```
SelectPlaylistSheet 안 [+ 곡 추가] → AddTracksSheet push
  → MusicSearch
      ├─ input 변경 → useSearchMusics
      ├─ 결과 아이템 ▶ → playlistAction.preview(track) → useMusicPreview 갱신 → MiniPlayer 활성
      ├─ MiniPlayer [추가] → useAddPlaylistTrack(currentTrack) → success toast
      └─ 다른 곡 ▶ → currentTrack 교체, loadVideoById (IFrame remount 0)
  → sheet × 닫기 → stopPreview() → currentTrack null → MiniPlayer 언마운트
```

### 6.6 sheet 스택 + 뒤로가기

```
초기 스택: []
push SelectPlaylistSheet: ['select-playlist']
push AddTracksSheet (in select sheet): ['select-playlist', 'add-tracks']
브라우저 뒤로가기 → popstate → 스택 pop → ['select-playlist']
다시 뒤로가기 → popstate → 스택 pop → []
다시 뒤로가기 → 라우터에 위임 → 이전 페이지 (또는 룸 외부)

× 닫기 (SelectPlaylistSheet 헤더) → closeAll() → history.go(-2)
```

## 7. 에러 처리

**i18n 정책** ([[feedback_pfplay_web_i18n_drift]] 정합): 표의 한글 메시지 (`재생 불가` · `다른 키워드로 시도해보세요` · `로그인이 필요해요` · `이미 플레이리스트에 있어요` · `플레이리스트 가득 찼어요` 등) 는 **i18n 키 신규 추가** — `t.partyroom.queue.*` 네임스페이스에 신규 정의. xlsx → ko.json/en.json 두 파일 동기. plan 단계에서 키 인벤토리 잠금.

| 케이스                                 | 처리                                                                                          |
| -------------------------------------- | --------------------------------------------------------------------------------------------- |
| 큐 락 (QueueStatus.CLOSE) 시 등록 시도 | useDialog.openAlertDialog (locked_queue_by_admin), mutation 미호출                            |
| 빈 플레이리스트 (playlists=[])         | confirm dialog → /me/playlist (MobileOnlyDesktopFeatureCard 노출)                             |
| 빈 곡 플레이리스트 (musicCount=0)      | SelectPlaylistSheet 의 빈 카드에 [+ 곡 추가] CTA                                              |
| mutation 실패 (4xx/5xx/network)        | global error toast (chunk 3 mini-toast 패턴)                                                  |
| sheet 닫기 중 mutation pending         | mutation lift-up (sheet unmount 무관), invalidation 으로 자동 반영                            |
| preview autoplay 차단                  | chunk 3.1 `AutoplayGestureGate` 패턴 mini-player 내부 적용 (TapToPlayButton)                  |
| YouTube IFrame 로드 실패               | mini-player 안 "재생 불가" 메시지, [추가] 는 유지 (재생 못해도 추가 가능, 데스크탑 정책 동일) |
| 곡 추가 실패 (중복 409 / 한도 422)     | toast 분리 메시지 (이미 있음 / 가득 참 / 기타)                                                |
| 검색 빈 결과                           | empty state "다른 키워드로 시도해보세요"                                                      |
| 검색 실패                              | toast + 재시도 버튼                                                                           |
| 게스트 dev console mutation 우회       | backend 401/403 → toast "로그인이 필요해요"                                                   |
| 같은 sheet 중복 push                   | useFullscreenSheet 에서 key 기반 dedup (마지막 호출만 effective)                              |

## 8. 테스트 전략

### 8.1 단위 (Vitest + RTL)

| 컴포넌트/hook                     | 핵심 단언                                                                                                                                                      |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `queue-panel.component`           | 게스트 → GuestCta+큐리스트 / 멤버+빈 → EmptyMember / 멤버+큐 → CurrentDjRow+QueueList+MemberActions                                                            |
| `queue-list-item.component`       | dj.crewId === myCrewId 시 ChangePlaylist 노출, 아닐 때 미노출                                                                                                  |
| `member-actions.component`        | isMeInQueue 토글에 따라 [+ DJ 등록] ↔ [큐에서 나가기]                                                                                                         |
| `guest-cta.component`             | 클릭 → router.push('/sign-in')                                                                                                                                 |
| `fullscreen-sheet.component`      | open=true 마운트, × 클릭 onClose, ← 클릭 onBack, body/footer slot 렌더, ESC 키 → onBack ?? onClose, role/aria-modal/aria-labelledby 단언, focus trap 진입/복귀 |
| `mini-player.component`           | currentTrack null 시 미렌더, 있음 시 wrapper + loadVideoById, [추가] → useAddPlaylistTrack                                                                     |
| `use-fullscreen-sheet.hook`       | push/pop 스택, popstate listener, dedup, unmount cleanup                                                                                                       |
| `use-mobile-select-playlist.hook` | playlists=[] → confirm → /me/playlist, 정상 → sheet → Promise resolve, 취소 → resolve(undefined)                                                               |
| `use-mobile-djing-guide.hook`     | djingGuideHidden=true 미오픈, false 오픈                                                                                                                       |
| `select-playlist-sheet.component` | 카드 클릭 → onSelect, 빈 곡 카드 → AddTracks 진입                                                                                                              |
| `add-tracks-sheet.component`      | 검색 ▶ → preview.start, 빈 결과 empty state                                                                                                                   |
| `current-dj-row.component`        | playback 메타 표시, Skip 미렌더 (모더레이션 OUT)                                                                                                               |
| `djing-guide-sheet.component`     | 카드 렌더, "다시 보지 않기" → preference 갱신, [시작] → close                                                                                                  |

### 8.2 통합 (Vitest + msw + RTL)

| 시나리오             | 단언                                                                                       |
| -------------------- | ------------------------------------------------------------------------------------------ |
| 등록 end-to-end      | playlists fetch → SelectPlaylistSheet → select → mutation → 큐 invalidate → 큐 리스트에 Me |
| 플레이리스트 변경    | 등록됨 → ChangePlaylist → SelectPlaylistSheet → 다른 playlist → mutation → 새 playlist 명  |
| 등록 해제            | confirm → unregister → invalidate → MemberActions = [+ DJ 등록]                            |
| add-tracks           | sheet open → 검색 → preview ▶ → 추가 → 성공 → mini-player 유지 (다음 곡 가능)             |
| 빈 플레이리스트      | playlists=[] → confirm → /me/playlist push                                                 |
| 큐 락 alert          | QueueStatus.CLOSE + 등록 → alert dialog, mutation 미호출                                   |
| DjingGuide 첫 등록   | djingGuideHidden=false + 등록 success → DjingGuideSheet 자동 오픈                          |
| DjingGuide hidden    | djingGuideHidden=true + 등록 success → sheet 미오픈                                        |
| mini-player ToS 보존 | track A→B 전환 시 wrapper 유지, IFrame remount 0, loadVideoById 호출                       |
| sheet history stack  | push A → push B → popstate → A 잔존 → popstate → 빈 → popstate → 라우터 위임               |

### 8.3 E2E (Playwright, mandatory CI)

chunk 3.1 mobile project 위에 시나리오 2개 추가 (auth 공유 패턴, `e2e/mobile/` 디렉토리 — chunk 3.1 의 `display-board.tos.spec.ts` 와 같은 위치).

**⚠ playwright.config.ts project glob 갱신 필수** (chunk 4 chunk 의 silent CI fail 회피, [[reference_e2e_silent_env_fallback_pattern]] 패턴 적용):

현재 chunk 3.1 의 `display-board-tos-mobile` project 는 `testMatch: /mobile\/display-board\.tos\.spec\.ts/` 로 단일 파일만 매칭. chunk 4 의 신규 spec 2개는 매칭 안 됨 → mandatory CI gate silent miss.

**잠금 처리** (chunk 4 시점):

- project 이름 `display-board-tos-mobile` → `mobile` 로 rename
- testMatch → `/mobile\/.+\.spec\.ts/` 로 확장 (모든 모바일 spec 자동 매칭)
- mandatory CI gate (branch protection Required check) 의 project 이름도 동기 갱신 — `Playwright E2E` workflow 가 잡는 게 project 가 아니라 entire suite 이라 영향 0 일 가능성 높으나, plan 단계에서 workflow yml 확인 잠금

| spec                             | 요지                                                                                                                 |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `e2e/mobile/dj-register.spec.ts` | 멤버 → 룸 입장 → 큐 탭 → [+ DJ 등록] → SelectPlaylistSheet → 선택 → 큐 리스트에 Me → [큐에서 나가기] → 복귀          |
| `e2e/mobile/add-tracks.spec.ts`  | 멤버 → 큐 탭 → SelectPlaylistSheet 안 곡 추가 → AddTracksSheet → 검색 → preview ▶ → 추가 → toast → mini-player 유지 |

**Title prefix**: chunk 3.1 의 `MTOS` / `MOBILE-TOS-` 패턴 따라 chunk 4 는 **`MDJ`** (DJ 시나리오) + **`MAT`** (add-tracks 시나리오) 신규 도입. cleanup helper (PR #366) 의 stale title pattern (`/^(E2EA|E2EB|E2EC|E2ED|MTOS|MOBILE-TOS-)/`) 에 `MDJ` · `MAT` 추가. afterAll closePartyroom (PR #364) 적용.

### 8.4 viewport / 환경

chunk 3.1 iPhone 13 chromium baseline 그대로 (PR #359). SE/Pixel 7 매트릭스는 chunk 3.1 post-merge follow-up 이라 chunk 4 중복 작업 안 함.

## 9. 스코프

### IN

- 큐 탭 콘텐츠 (멤버/게스트 분기)
- DJ 등록·플레이리스트 변경·해제 흐름
- SelectPlaylistSheet · AddTracksSheet · DjingGuideSheet
- FullscreenSheet 인프라 + history stack
- MiniPlayer (sheet 내부 bottom)
- mutation 승격 (widget → feature) + 데스크탑 import path 변경
- 단위 + 통합 + E2E 2건

### OUT

- 큐 락/언락 · DJ 삭제 · Skip · 모더레이션 (스코프 §OUT, 모더레이션 데스크탑 전용)
- 라이브러리 관리 (플레이리스트 생성·정렬·편집) — 데스크탑 전용
- `MobileGuard`·`/mobile-notice`·i18n 제거 — chunk 5 catch-up
- ROLE_GUEST 백엔드 회귀 테스트 — chunk 5 cross-repo PR
- lobby card 디테일 (아바타·blur·Typography·PFInfoOutline) — chunk 5 design backlog
- `next=` 쿼리 패턴 도입 — 별건
- SE/Pixel 7 viewport — chunk 3.1 post-merge follow-up

## 10. 위험 + 트레이드오프

| #   | 위험                                                                                  | 완화                                                                                                                                                                                                                                                                                                                                                                                           |
| --- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | sheet history stack × hash tab sync × Next.js router 의 상호작용                      | plan 단계 spike + 통합 테스트 명시 (§8.2 스택 단언)                                                                                                                                                                                                                                                                                                                                            |
| 2   | mini-player IFrame 의 ToS 보존 vs 80px 공간 압박                                      | §5.5 spike 분기 잠금 (A/B/C). default = (A) visible frame + 높이 80→112px. plan 단계 spike 가 (A) 의 위험 발견 시 (C) inline expand 로 재설계                                                                                                                                                                                                                                                  |
| 3   | mutation 승격 시 데스크탑 import path 변경의 grep 누락                                | 데스크탑 widget 트리에서 다음 grep — `from '../api/use-register-me-to-queue'` · `from '../api/use-change-my-playlist'` · `from '../api/use-unregister-me-from-queue'` (각각 일괄 교체). CI typecheck + 데스크탑 통합 테스트 (`dj-queue.integration.test.ts`) 회귀 확인                                                                                                                         |
| 4   | `useDialog` 데스크탑 컴포넌트의 모바일 호환                                           | shared 컴포넌트라 모바일 viewport 자연 적응 (chunk 3 의 ban toast 와 동일). **검증 acceptance**: (a) 단위 테스트 (alert·confirm dialog 렌더), (b) 모바일 viewport 헤드드 1회 (iPhone 13 chromium, dialog content 가 화면 폭 안에 fit), (c) chunk 3 통합 테스트의 dialog 회귀 0. 셋 모두 GREEN 시 통과                                                                                          |
| 5   | 룸 메인 재생 vs preview mini-player 의 동시 audio 출력                                | **잠금 default: v1 = 둘 다 자연 출력**. 사용자 의도 = 미리듣기 짧음 + 어차피 모바일 단일 스피커. plan 단계 spike 결과 사용자 거슬림 발견 시 follow-up — preview start 시 룸 메인 mute (`useCurrentPartyroom.updatePlaybackVolume(0)`) → preview stop 시 복원. v1 동작은 잠금. **iOS silent switch / AudioContext interrupt 는 v1 미관여** (단말 OS 정책 그대로 수용, 사용자 실측 후 follow-up) |
| 6   | SelectPlaylistSheet → AddTracksSheet → 곡 추가 → SelectPlaylistSheet 복귀 시 리프레시 | playlists 의 musicCount 캐시 무효화 (`useFetchPlaylists` invalidate) 가 필요. AddPlaylistTrack mutation 의 onSuccess 에 이미 있어야 함 — 데스크탑 동작 검증 후 같은 invalidation 키 사용                                                                                                                                                                                                       |
| 7   | DjingGuide 가 등록 직후 sheet stack 위에 push 될 때 SelectPlaylistSheet 와 중첩       | 등록 mutation onSuccess 시점에 SelectPlaylistSheet 는 이미 close. push 순서는 select close → register mutation → guide push. plan 단계에서 순서 명시                                                                                                                                                                                                                                           |

## 11. 마이그레이션 시나리오

1. mutation 3개 (`register-me-to-queue`·`change-my-playlist`·`unregister-me-from-queue`) 를 `widgets/partyroom-djing-dialog/api/*` 에서 `features/partyroom/<action>/api/*` 로 이동
2. 데스크탑 widget 3개 컴포넌트의 import path 변경
3. 데스크탑 통합 테스트 (`widgets/partyroom-djing-dialog/api/dj-queue.integration.test.ts`) 는 mutation 3개 함께 검증하므로 그대로 동작 + import path 만 갱신 (`@/features/partyroom/<action>` 사용). 별도 분할 안 함. 데스크탑 widget 의 다른 ui 통합 테스트는 widget 사적 컴포넌트 (RegisterButton 등) 검증이라 그대로 위치 유지.

   **사유** (위치-대상 분리 어색함 수용): 데스크탑 `widgets/partyroom-djing-dialog` 자체는 chunk 4 이후에도 유지 (데스크탑 dialog UI 는 그대로). widget 폐기 계획 없음 + FSD 의 약한 위반 (api 디렉토리에 외부 feature 를 테스트하는 파일 잔존) 을 수용 — mutation 3개 통합 검증을 분할하면 widget 자체 회귀 가시성 ↓. plan-time 재논의 회피용 잠금

4. CI typecheck + 데스크탑 회귀 (chunk 1~3.1 모두 GREEN 유지)
5. chunk 4 의 모바일 컴포넌트 추가 (PR 의 별도 commit 들)
6. `MobilePartyroomRoomTabs` 큐 탭 placeholder → `MobilePartyroomQueuePanel` 교체 (1줄 변경)
7. E2E 시나리오 2개 추가
8. dev/stg 머지 → 사용자 헤드드 확인 → release/main ship

### chunk 4 prod 중간 상태

- 모바일 멤버: 큐 보기 + 등록/해제/플레이리스트 변경 + add-tracks 가능
- 모바일 게스트: 큐 보기 + 로그인 CTA 만 (mutation 시도 시 자연 차단)
- `/mobile-notice` 라우트 / MobileGuard 잔존 — chunk 5 에서 제거 (chunk 1 fallback 카드도 마찬가지)
- ROLE_GUEST 백엔드 회귀 가드 미적용 — chunk 5 동반 PR

## 12. 관련

### 메모리

- [[feedback_pr_series_workflow]] 5-PR 시리즈, chunk 단위 confirm, polish follow-up
- [[feedback_commit_consolidation_before_push]] push 전 squash
- [[feedback_korean_issue_commit_pr]] 한글
- [[feedback_elegant_no_code_dirtying]] mutation 승격 결정 근거
- [[feedback_autonomous_execution]] 본 brainstorming 의 진행 패턴
- [[project_mobile_responsive_scope_340]] 스코프 잠금
- [[project_mobile_chunk31_ci_completed]] chunk 3.1 mandatory CI 완성, ToS 보존 패턴
- [[reference_e2e_silent_env_fallback_pattern]] e2e helper API_HOST 명시
- [[reference_pfplay_web_local_dev_http_webpack]] 로컬 검증
- [[wait-all-ci-incl-e2e-before-merge]] e2e 포함 모든 CI 머지 게이트

### 선행 문서

- `2026-05-22-mobile-responsive-scope-design.md` 스코프
- `2026-05-28-mobile-responsive-architecture-design.md` 아키텍처 (§3.3 chunk 4 / §4.4 큐 탭 wireframe / §2.2 게이트 매트릭스 / §2.4 데스크탑 전용 가드)
- `2026-05-29-mobile-display-board-tos-redesign.md` chunk 3.1 ToS 패턴 (mini-player 재사용)
- chunk 1 plan `2026-05-28-mobile-responsive-chunk1-foundation.md`
- chunk 2 plan `2026-05-28-mobile-responsive-chunk2-lobby-room-listening.md`
- chunk 3 plan `2026-05-29-mobile-responsive-chunk3-chat-crews-tabs.md`

### GH 이슈

- pfplay-web#340 (스코프)

## 13. 다음

본 spec → spec-document-reviewer dispatch → 사용자 spec 리뷰 게이트 → `writing-plans` skill 진입 → `2026-05-29-mobile-responsive-chunk4-dj-queuing.md` plan 작성 → TDD 실행 (또는 직접 구현 + 최종 reviewer 패턴) → dev/stg 머지 → release/main ship (chunk 3+3.1 와 묶음 가능 여부는 사용자 결정).
