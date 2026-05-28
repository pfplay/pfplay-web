# 모바일 디스플레이 보드 — YouTube ToS 보존 재설계 spec

**Date:** 2026-05-29
**Chunk:** chunk 3.1 (chunk 3 polish follow-up — chunk 3 머지 직후 atomic PR)
**Status:** Draft v2 → spec-document-reviewer (2차) → 사용자 승인 → writing-plans

## 1. Goal

모바일 룸 (`/parties/[id]` mobile branch) 의 sticky-top **디스플레이 보드 (`widgets-mobile/partyroom-display-board`)** 를 YouTube IFrame Player API 서비스 약관에 부합하도록 재설계한다. 사용자 통제 (축소/확장 토글) 도 함께 제공하되, 어떤 상태에서도 YouTube IFrame 이 시각적으로 가려지지 않도록 보장한다.

부수적으로 데스크탑이 가진 autoplay 차단 감지 + gesture gate UX 를 모바일에도 차용한다 (현재 chunk 2 미보유).

## 2. 배경: 왜 재설계가 필요한가

### 2.1 chunk 2 의 현 모바일 디스플레이 (재설계 직전 상태)

`widgets-mobile/partyroom-display-board/partyroom-display-board.component.tsx:88-102`

```tsx
{
  playbackActivated && playback?.linkId && (
    <div
      aria-hidden
      className='absolute pointer-events-none w-px h-px overflow-hidden opacity-0 -z-10'
    >
      <YoutubePlayer
        url={`https://www.youtube.com/watch?v=${playback.linkId}`}
        playing={playbackActivated}
        muted={false}
        volume={1}
        width='1px'
        height='1px'
      />
    </div>
  );
}
```

→ 재생 중 IFrame 이 **1px × 1px + opacity 0 + pointer-events:none**. 사실상 audio-only.

### 2.2 YouTube IFrame Player API ToS 충돌

YouTube API 서비스 약관 (developers.google.com/youtube/terms 등) 중 다음 조항 (정확한 표현은 갱신되나 정신은 동일):

> 임베디드 YouTube 플레이어는 사용자에게 표시되어야 하며, 오디오만 추출하는 백그라운드 재생은 허용되지 않는다 (YouTube Music 등 별도 라이선스 제외).

> Embedded API 호출자는 비디오 플레이어의 일부를 숨기거나 동작을 변경해서는 안 된다 (이 정신은 1px hidden / opacity 0 패턴을 명백히 배제).

위반 시 API 키 차단·앱 정지 사례 존재 (Spotify·Tubi 등). chunk 2 가 dev/stg 까지는 도달했으나 **prod ship 전 fix 필수**.

### 2.3 데스크탑과의 시각 연속성 결손

데스크탑 (`widgets/partyroom-display-board/ui/parts/video.component.tsx`) 은 **재생 안 해도 16:9 검정 placeholder 박스 항상 visible** (line 317-321). 모바일은 chunk 2 에서 텍스트 한 줄 (`'지금 재생 중인 곡이 없어요'`) 만 표시 → 사용자 UX 단절 ("디스플레이가 없으니 이상").

## 3. 결정 잠금 (brainstorming 산출물)

| #   | 항목                 | 결정                                                                                                                                          |
| --- | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | chunk 구분           | chunk 3 머지 직후 chunk 3.1 후속 PR (atomic, develop 진입)                                                                                    |
| 2   | 재생 중 default      | **Mode A** — 16:9 풀폭 YoutubePlayer + 트랙메타                                                                                               |
| 3   | 비재생 default       | **Mode C** — 16:9 검정 placeholder 박스 (데스크탑 시각 연속성)                                                                                |
| 4   | 축소 토글            | 우상단 ▾ 아이콘 overlay. 클릭 시 Mode A↔Mode B 전환                                                                                          |
| 5   | Collapsed 크기       | **80×45 px** (iOS HIG 44×44 hit-area 근접, ToS 보수) + 트랙명·DJ 가로 row                                                                     |
| 6   | 비재생 시 토글       | hide (가릴 영상 없음) — 항상 Mode C                                                                                                           |
| 7   | State persistence    | 룸 mount 시 `expanded=true` 1회 init. component-local `useState`. **트랙 변경·Mode C 진입 모두 `expanded` 미수정 (사용자 마지막 선택 보존)**. |
| 8   | autoplay polish      | 데스크탑 `autoplayBlocked` + gesture gate 패턴 모바일 차용 (동봉). hook 입력에 `videoId` 포함 → 트랙 변경 시 차단 detect 재armed.             |
| 9   | 데스크탑 격리        | 데스크탑 `widgets/partyroom-display-board/*` 변경 0                                                                                           |
| 10  | lobby 카드 디테일    | 본 spec OUT — 별도 후속 결정                                                                                                                  |
| 11  | i18n inline 한국어   | 본 chunk 도 chunk 2·3 의 inline 한국어 정책 유지. **chunk 5 catch-up 에서 모바일 i18n 키 일괄 이주 시 함께 처리**.                            |
| 12  | YoutubePlayer 사이징 | **부모 wrapper 가 size 결정, YoutubePlayer 는 `width='100%' height='100%'` 고정** (prop 변경에 의한 remount 위험 회피).                       |
| 13  | YoutubePlayer `key`  | `key={`video-${playerReady}-${played}`}` — 데스크탑과 동일. videoId/endTime/mode 미포함.                                                      |

## 4. Architecture

### 4.1 변경 영역

| 경로                                                                                    | 변경                                                                                             |
| --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `src/widgets-mobile/partyroom-display-board/partyroom-display-board.component.tsx`      | 본문 대규모 재설계 (Mode 핸들 + 토글 wiring)                                                     |
| `src/widgets-mobile/partyroom-display-board/ui/parts/video-frame.component.tsx`         | 신규 — 16:9 wrapper + YoutubePlayer + autoplay gesture gate                                      |
| `src/widgets-mobile/partyroom-display-board/ui/parts/video-frame.component.test.tsx`    | 신규 — 3 mode 회귀 + ToS 가드                                                                    |
| `src/widgets-mobile/partyroom-display-board/ui/parts/expand-toggle.component.tsx`       | 신규 — ▾/◂ 토글 버튼                                                                             |
| `src/widgets-mobile/partyroom-display-board/ui/parts/expand-toggle.component.test.tsx`  | 신규 — 클릭 콜백 + aria                                                                          |
| `src/widgets-mobile/partyroom-display-board/ui/parts/blank-placeholder.component.tsx`   | 신규 — Mode C 검정 16:9 박스                                                                     |
| `src/widgets-mobile/partyroom-display-board/ui/parts/now-playing-meta.component.tsx`    | 신규 — column/row 양 layout                                                                      |
| `src/widgets-mobile/partyroom-display-board/lib/use-autoplay-gesture-gate.hook.ts`      | 신규 — 데스크탑 `use-auto-resume-on-pause.hook.ts` 와 별개. autoplay 차단 감지 + gesture trigger |
| `src/widgets-mobile/partyroom-display-board/lib/use-autoplay-gesture-gate.hook.test.ts` | 신규                                                                                             |

> **데스크탑 `widgets/partyroom-display-board/*` 0 수정** — C3 격리 (sibling 사본 패턴, chunk 2·3 와 동일 정책).

### 4.2 3 mode layout 사양

```
┌─────────────────── Mode A: 재생 + expanded (default) ───────────────────┐
│  ←   Main Stage   ⋮                                                      │
│ ┌──────────────────────────────────────────────────────────┐       ▾    │
│ │                                                          │            │
│ │           YouTube IFrame 16:9 풀폭                       │            │
│ │                                                          │            │
│ └──────────────────────────────────────────────────────────┘            │
│  🎵 Track name                                                          │
│  🎧 DJ nickname                                                         │
│  ❤ 0   👎 0   ⭐ 0                                                       │
└─────────────────────────────────────────────────────────────────────────┘
```

```
┌─────────────────── Mode B: 재생 + collapsed ─────────────────────────────┐
│  ←   Main Stage   ⋮                                                      │
│ ┌────────┐                                                       ◂      │
│ │ 80×45  │  🎵 Track name                                                │
│ │  ▶     │  🎧 DJ nickname                                               │
│ └────────┘                                                               │
│  ❤ 0   👎 0   ⭐ 0                                                       │
└─────────────────────────────────────────────────────────────────────────┘
```

```
┌─────────────────── Mode C: 비재생 (토글 hide) ───────────────────────────┐
│  ←   Main Stage   ⋮                                                      │
│ ┌──────────────────────────────────────────────────────────┐            │
│ │                                                          │            │
│ │              zZz... 지금 재생 중인 곡이 없어요             │            │
│ │                       (검정 placeholder 16:9)              │            │
│ └──────────────────────────────────────────────────────────┘            │
│  (트랙메타 + 리액션 미표시, 또는 옅게)                                       │
└─────────────────────────────────────────────────────────────────────────┘
```

**Mode D (비재생+collapsed) 미정의** — 비재생 시 Toggle hide 라 사용자가 진입 불가. **Mode C 는 `expanded` state 를 변경하지 않음** — 재생 재개 시 사용자 마지막 선택 (Mode A 또는 B) 으로 복귀.

### 4.3 컴포넌트 트리

```
MobilePartyroomDisplayBoard (root, 'use client')
├─ <header> 헤더 row (뒤로 · 룸이름 · ⋮)
│   — chunk 2 그대로
└─ <section data-testid='display-area'>
    ├─ VideoFrame                       ← 신규
    │   ├─ <div className='video-wrapper'> 부모 wrapper (사이즈 결정)
    │   │   — Mode A: 'aspect-video w-full'
    │   │   — Mode B: 'w-20 h-[45px] shrink-0'
    │   │   — Mode C: 'aspect-video w-full bg-black' (YoutubePlayer 미렌더, BlankPlaceholder 자리)
    │   ├─ YoutubePlayer (dynamic import, Mode A·B 만 mount)
    │   │   — width='100%' height='100%' 고정. 부모 wrapper class 가 실 크기 결정.
    │   ├─ BlankPlaceholder (Mode C 만)
    │   ├─ AutoplayGestureGate (Mode A 만 overlay — Mode B 80×45 에는 게이트 부착 안 함)
    │   └─ ExpandToggle (Mode A·B 만 visible, Mode C 미렌더)
    ├─ NowPlayingMeta (Mode A·B 별 layout)
    │   — Mode A: 'column' (박스 아래 column)
    │   — Mode B: 'row' (박스 우측 row)
    └─ ActionButtons (리액션, chunk 2 그대로)
```

### 4.4 State 모델

```tsx
// MobilePartyroomDisplayBoard 본문
const [expanded, setExpanded] = useState(true); // 룸 mount 시 1회 init

const playbackActivated = useCurrentPartyroom((s) => s.playbackActivated);
const playback = useCurrentPartyroom((s) => s.playback);

// 단일 trigger 값: linkId 가 있으면 재생 가능, 없으면 Mode C
const videoId = playbackActivated ? (playback?.linkId ?? null) : null;
const isPlaying = videoId !== null;

// Mode 결정
const mode: 'A' | 'B' | 'C' = !isPlaying ? 'C' : expanded ? 'A' : 'B';
```

**불변식**:

- `setExpanded` 호출 지점 = **사용자 토글 클릭 이벤트 1곳뿐**. videoId 변화·track change·Mode C 진입 시 `expanded` 자동 변환 X.
- Mode C 진입은 `videoId === null` 의 derived state. `expanded` 자체는 그대로 보존.
- Mode C → A/B 복귀 시 (videoId 재할당) `expanded` 의 마지막 사용자 선택 그대로 → Mode A 또는 B 직접 진입.

### 4.5 YoutubePlayer 사이징 — wrapper 기반 (remount 회피)

reviewer 1차 이슈 #1 + #4 반영. react-player/youtube 의 width/height prop 변경이 IFrame remount 를 유발할 가능성을 차단:

```tsx
// VideoFrame 본문 발췌
return (
  <div className='relative'>
    <div className={cn('relative', wrapperSizeClass(mode))}>
      {mode === 'C' ? (
        <BlankPlaceholder />
      ) : (
        <YoutubePlayer
          key={`video-${playerReady}-${played}`}
          url={`https://www.youtube.com/watch?v=${videoId}`}
          playing={playerReady}
          volume={muted ? 0 : volume}
          muted={muted}
          width='100%'
          height='100%'
          className='bg-black rounded' // hidden, opacity-0, w-px, h-px, pointer-events-none 절대 금지
          onReady={onPlayerReady}
          onStart={onStart}
          onPlay={onPlay}
          onPause={onPause}
          config={config}
        />
      )}
      {mode === 'A' && showGate && <AutoplayGestureGate onClick={handleGesturePlay} />}
      {(mode === 'A' || mode === 'B') && <ExpandToggle expanded={expanded} onToggle={onToggleExpand} />}
    </div>
    {(mode === 'A' || mode === 'B') && <NowPlayingMeta layout={mode === 'A' ? 'column' : 'row'} … />}
  </div>
);

function wrapperSizeClass(mode: 'A' | 'B' | 'C'): string {
  switch (mode) {
    case 'A':
      return 'aspect-video w-full';
    case 'B':
      return `w-[${COLLAPSED_VIDEO_WIDTH}px] h-[${COLLAPSED_VIDEO_HEIGHT}px] shrink-0`;
    case 'C':
      return 'aspect-video w-full bg-black';
  }
}

export const COLLAPSED_VIDEO_WIDTH = 80; // ToS 하한
export const COLLAPSED_VIDEO_HEIGHT = 45;
```

**핵심 보장**:

1. YoutubePlayer 의 width/height prop 은 **항상 '100%'/'100%'** — react-player 내부 IFrame 재로드 위험 0.
2. Mode A↔B 전환 = 부모 wrapper 의 Tailwind class 만 교체 → CSS-only 리사이즈, IFrame 안정성 유지.
3. Mode A↔C, B↔C 전환 = YoutubePlayer 자체 mount/unmount (재생 가능 여부에 따라 IFrame 자체가 필요/불요). Mode C 진입 시 IFrame unmount 는 ToS 안전 (재생 안 함 → IFrame 불요).
4. Mode B↔A 전환 시 IFrame mount 유지 → 재생 연속성.
5. `key={`video-${playerReady}-${played}`}` 데스크탑 동일 — gesture-gate-release-then-replay 라이프사이클 보존. **mode·videoId·endTime 은 key 에 포함 X**.

### 4.6 useAutoplayGestureGate hook

```ts
// Pseudo signature
function useAutoplayGestureGate({
  playerRef,
  playable,
  videoId, // ← reviewer 1차 #7: 트랙 변경 시 차단 detect 재armed
}: {
  playerRef: RefObject<TReactPlayer | null>;
  playable: boolean;
  videoId: string | null;
}) {
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [played, setPlayed] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);

  // onReady 후 1500ms 내 onPlay 가 없으면 차단으로 간주.
  // videoId 변경 시 played reset → 새 트랙에 대해 다시 detect.
  useEffect(() => {
    if (!playerReady || played) return;
    const timer = setTimeout(() => setAutoplayBlocked(true), AUTOPLAY_DETECT_MS);
    return () => clearTimeout(timer);
  }, [playerReady, played, videoId]); // ← videoId dep 가 핵심

  // onPlay → played=true, autoplayBlocked=false
  // onReady → playerReady=true, seekToLive

  const handleGesturePlay = () => {
    playerRef.current?.getInternalPlayer()?.playVideo?.();
    setAutoplayBlocked(false);
  };

  return {
    autoplayBlocked,
    played,
    playerReady,
    handleGesturePlay,
    onReady,
    onStart,
    onPlay,
    onPause,
  };
}

export const AUTOPLAY_DETECT_MS = 1500;
```

본 hook 은 데스크탑 `video.component.tsx:73-153` 의 패턴을 추출한 **모바일 전용 사본**. 데스크탑 본문은 미수정 (격리). **중복 코드 발생 — 본 spec §9 risk #5 로 등록 + 후속 GH 이슈로 통합 트래킹**.

## 5. ToS 보존 검증 포인트

각 항목은 단위·통합·**Playwright headed** 다층 가드.

| 가드 항목                                                                                                            | 검증 방법                                                                                                                                                               | 레이어                |
| -------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| Mode A: YoutubePlayer width/height prop = '100%'/'100%'                                                              | 통합 테스트 — react-player mock 의 props 단언                                                                                                                           | unit/it               |
| Mode A: 부모 wrapper 가 `aspect-video w-full` class 보유                                                             | DOM 단언                                                                                                                                                                | unit/it               |
| Mode B: 부모 wrapper 의 width ≥ 80px, height ≥ 45px (정확값)                                                         | DOM class + Playwright `boundingBox()` 단언                                                                                                                             | unit + headed         |
| Mode C: YoutubePlayer 미렌더, BlankPlaceholder 만 렌더                                                               | react-player mock 호출 0회 단언                                                                                                                                         | unit/it               |
| 어떤 mode 에서도 YoutubePlayer wrapper 의 `className` 에 `hidden` 토큰 없음                                          | 정규식 `expect(class).not.toMatch(/\bhidden\b/)`                                                                                                                        | unit/it               |
| 어떤 mode 에서도 wrapper className 에 `opacity-0`, `w-px`, `h-px`, `pointer-events-none` 없음                        | 정규식 단언                                                                                                                                                             | unit/it               |
| YoutubePlayer wrapper / IFrame element 의 직접 부착 `aria-hidden='true'` 없음 (decorative SVG 등 내부 아이콘은 허용) | DOM 단언 — `expect(getByTestId('video-wrapper')).not.toHaveAttribute('aria-hidden')` 같이 scoping 명시                                                                  | unit/it               |
| **Playwright 헤드드: IFrame 가 ancestor 에 의해 가려지지 않음**                                                      | Playwright `await expect(iframe).toBeVisible()` (built-in: ancestor display/visibility/opacity 모두 체크) + `await iframe.boundingBox()` 의 width >= 80 && height >= 45 | **headed (required)** |
| **Playwright 헤드드: IFrame 의 computed CSS `visibility !== 'hidden'` && `opacity > 0`**                             | `await page.locator('iframe').evaluate(el => getComputedStyle(el))`                                                                                                     | **headed (required)** |
| **Playwright 헤드드: IFrame 의 boundingBox 가 viewport 안에 있고 off-screen 아님**                                   | `boundingBox.x > -box.width && boundingBox.y > -box.height && < viewport edges`                                                                                         | **headed (required)** |

**중요**: unit 레이어의 mock 은 ancestor visibility (parent `display:none`, `transform:scale(0)`, off-viewport positioning) 를 잡지 못함. **Playwright headed 가 ToS 가드의 1차 게이트**. CI 에서 반드시 실행되는 mandatory test 로 등록.

## 6. 컴포넌트 책임 분리

### 6.1 `VideoFrame`

**책임**: 단일 root — 3 mode 중 하나를 렌더. ExpandToggle·BlankPlaceholder·YoutubePlayer·AutoplayGestureGate orchestration.

**Props** (reviewer 1차 #8 — derive 단일화):

```ts
interface VideoFrameProps {
  videoId: string | null; // null = Mode C 강제
  expanded: boolean;
  onToggleExpand: () => void;
}

// VideoFrame 내부 derive
const mode: 'A' | 'B' | 'C' = videoId === null ? 'C' : expanded ? 'A' : 'B';
```

**Mode 분기**:

- `videoId === null` → Mode C: BlankPlaceholder 렌더. ExpandToggle 미렌더 (사용자 진입 불가).
- `videoId !== null && expanded` → Mode A: YoutubePlayer 16:9 + Toggle ▾.
- `videoId !== null && !expanded` → Mode B: YoutubePlayer 80×45 + Toggle ◂.

### 6.2 `ExpandToggle`

**책임**: 영상 우상단 ▾/◂ 토글. controlled.

**Props**:

```ts
interface ExpandToggleProps {
  expanded: boolean;
  onToggle: () => void;
}
```

**a11y**:

- `<button>` + `aria-label={expanded ? '영상 가리기' : '영상 펼치기'}` (inline 한국어, §3 row 11)
- `aria-pressed={!expanded}` (collapsed=pressed state)
- min-h-[44px] min-w-[44px] hit-area

### 6.3 `BlankPlaceholder`

**책임**: Mode C 의 16:9 검정 박스 + 안내 텍스트.

**Props**: 없음. 본문 inline 한국어 ("지금 재생 중인 곡이 없어요") — §3 row 11 정책.

### 6.4 `NowPlayingMeta`

**책임**: 트랙명·DJ·duration 텍스트 렌더. Mode A·B 가 같은 데이터를 다른 layout 으로.

**Props**:

```ts
interface NowPlayingMetaProps {
  layout: 'column' | 'row'; // A=column, B=row
  trackName: string;
  djNickname: string | null;
  duration: string;
}
```

### 6.5 `AutoplayGestureGate`

**책임**: Mode A 의 IFrame 영역 위 overlay. autoplay 차단 시 visible, 클릭 시 `handleGesturePlay` 호출.

**Mode B (80×45) 에서는 게이트 자체 미렌더** — 80×45 는 tap target 으로 좁고, 사용자가 Mode B 로 전환했다는 건 audio 청취 의도. autoplay 차단된 채 Mode B 일 때는 Mode A 로 자동 복귀 X (사용자 의도 보존), 단 audio 안 나는 상태 사용자 인지 가능.

대신 Mode B 의 NowPlayingMeta 옆에 작은 ▶ 버튼 (tap-to-play) 추가 — Mode B 에서도 gesture release 경로 제공.

## 7. 테스트 전략

### 7.1 단위 테스트

- `video-frame.component.test.tsx` (11 케이스)
  - Mode A 렌더: YoutubePlayer 호출 (width=100%, height=100%), wrapper class `aspect-video w-full`, Toggle ▾, BlankPlaceholder 미렌더.
  - Mode B 렌더: YoutubePlayer width=100%/height=100% (그대로), wrapper class width=80 height=45, Toggle ◂.
  - Mode C 렌더: BlankPlaceholder visible, YoutubePlayer 미렌더, Toggle 미렌더.
  - Mode A→B 전환: YoutubePlayer mock 호출 count 유지 (remount X) + wrapper class 만 교체.
  - Mode B→C 전환: YoutubePlayer mock unmount 단언.
  - Mode C→A 전환: YoutubePlayer remount.
  - autoplayBlocked && Mode A 시 gesture gate overlay 렌더, 클릭 시 playVideo() 호출.
  - autoplayBlocked && Mode B 시 gate 미렌더, NowPlayingMeta 옆 ▶ tap-to-play 렌더.
  - **ToS 가드 (회귀)**: 모든 mode 에서 wrapper className 에 `hidden`/`opacity-0`/`w-px`/`h-px`/`pointer-events-none` 토큰 부재.
  - **ToS 가드**: video-wrapper testid 가진 element 에 `aria-hidden='true'` 직접 부착 안 됨.
  - Props 안전: `videoId=null && expanded=true/false` → Mode C 강제 진입 (Mode A/B 진입 안 됨).
- `expand-toggle.component.test.tsx` (4 케이스)
  - aria-label expanded·collapsed 분기.
  - 클릭 시 onToggle 콜백.
  - aria-pressed 단언.
  - 44×44 hit-area class 단언.
- `use-autoplay-gesture-gate.hook.test.ts` (7 케이스, reviewer 1차 #7 반영)
  - 초기 ready/played/blocked 모두 false.
  - onReady 호출 후 playerReady=true.
  - 1500ms 내 onPlay 없으면 autoplayBlocked=true.
  - onPlay 호출 시 played=true, autoplayBlocked=false.
  - handleGesturePlay 가 internal playVideo() 호출.
  - **videoId 변경 시 played reset + 1500ms 새 타이머 시작** (track change 시 차단 detect 재armed).
  - **playable=false 진입 시 모든 state reset** (Mode C 진입 시 cleanup).

### 7.2 통합 테스트

- `partyroom-display-board.component.test.tsx` (기존 없음, 신규 9 케이스, reviewer 1차 #2 반영)
  - 룸 mount 시 expanded=true default.
  - 토글 클릭 → collapsed (Mode B).
  - 다시 클릭 → expanded (Mode A).
  - playback null → Mode C, toggle hide.
  - playback 변경 후에도 expanded state 보존 (자동 expand 없음).
  - **Mode C → playback 재할당 → expanded 의 마지막 사용자 선택 (true 또는 false) 그대로 → Mode A 또는 B 진입** (Mode C 가 expanded 미수정 보장).
  - **Mode B → playback null → Mode C → playback 재할당 → 여전히 Mode B** (사용자 collapse 유지).
  - 룸 unmount → 다시 mount 시 expanded=true reset (component-local state).
  - **트랙 변경 시 autoplay re-arm**: videoId 변경 + 1500ms 후 autoplayBlocked=true 단언 (Mode A 인데 autoplay 다시 차단된 케이스 시뮬레이션).

### 7.3 Playwright 헤드드 테스트 (**mandatory CI**)

reviewer 1차 #3 + #6 반영. unit/integration 레이어가 잡지 못하는 ancestor visibility / sticky-top 높이 변화 / chat 스크롤 영향 등을 가드.

- `display-board.tos.spec.ts` (신규 — `tests-e2e/mobile/` 디렉토리 또는 기존 e2e 위치 따름)
  - Mode A 진입: `await expect(page.locator('iframe[src*="youtube.com/embed"]')).toBeVisible()` + `boundingBox()` width ≥ 80, height ≥ 45.
  - Mode A 진입: computed style `visibility !== 'hidden'`, `opacity > 0`.
  - Mode A 진입: `boundingBox()` 가 viewport 안에 있음 (off-screen 좌표 아님).
  - Toggle 클릭 → Mode B: width === 80, height === 45 (정확값), IFrame 여전히 visible.
  - Toggle 두 번째 클릭 → Mode A 복귀: 동일 IFrame element (selector 안정성) → remount 안 됨 검증.
  - **sticky-top 높이 변화 시 chat scroll position 보존**: 채팅 탭 스크롤을 위로 올려둔 상태에서 Toggle 클릭 → chat scroll offset 변화 ≤ tolerance (~10px 허용).
  - Mode C (playback null mock or 룸 입장 직후 첫 트랙 전): BlankPlaceholder visible, IFrame element 미존재.

### 7.4 viewport / 환경 매트릭스 (Playwright)

- iPhone 13 (390×844)
- iPhone SE (375×667)
- Pixel 7 (412×915)
- 가로 orientation 1회 — toggle 후에도 IFrame ≥ 80×45 보존.

## 8. 스코프

### IN

- `widgets-mobile/partyroom-display-board` 본문 재설계
- VideoFrame·ExpandToggle·BlankPlaceholder·NowPlayingMeta·AutoplayGestureGate 신규 sibling parts
- useAutoplayGestureGate 신규 hook (mobile-only fork — §9 risk #5 등록)
- 데스크탑 `useUserPreferenceStore` (volume·muted) 재사용 (read-only import)
- 데스크탑 `Playback.getInitialSeek` 재사용 (read-only import)
- ToS 가드 회귀 테스트 (3-layer: unit + integration + Playwright headed)
- Playwright headed test 를 CI 의 mandatory 단계로 등록 (또는 stg vercel-preview-e2e workflow 에 추가)

### OUT

- 데스크탑 `widgets/partyroom-display-board/*` 변경 0
- chunk 2 의 `ActionButtons` (리액션) 변경 0
- chunk 3 의 탭·채팅·크루 변경 0 (단 sticky-top 높이 변화의 영향 가드는 §7.3 에서 검증)
- DJ 큐 (chunk 4)
- lobby 카드 디자인 (별도 결정)
- 사용자가 영상 일부분만 hide 하거나 mute toggle 추가 — v1 스코프 아님 (현 결정은 mute=userPreferenceStore 따라감)
- userPreference 에 expanded 영구 저장 (사용자 결정: session reset)
- 데스크탑·모바일 autoplay hook 의 단일화 (§9 risk #5, 후속 작업)
- Mode B 80×45 → 96×54 등 픽셀 조정 (상수 분리는 본 spec, 값 변경은 prod 후 사용자 결정)

## 9. 위험 + 트레이드오프

| #   | 위험                                                                                                          | 완화                                                                                                                                                                                                                                                           |
| --- | ------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Mode A 풀폭 IFrame 이 sticky-top 점유 → 채팅 영역 잠식 (iPhone SE 568px 등 small viewport 메시지 4~5 visible) | 사용자가 collapse 토글로 80×45 Mode B 전환 → 채팅 영역 ~150px 확보                                                                                                                                                                                             |
| 2   | react-player 의 width/height prop 변경 시 IFrame remount 위험                                                 | **해결됨** — §4.5 wrapper 기반 사이징 (YoutubePlayer width/height 항상 '100%' 고정, 부모 div Tailwind class 만 교체). Mode A↔B 전환 시 IFrame 자체 stability 유지. Playwright `display-board.tos.spec.ts` 의 "Toggle 두 번 클릭 → same element" 가 회귀 가드. |
| 3   | autoplay gesture gate UX 가 모바일에 처음 도입 → 새로고침·shortlink 진입 사용자 경험 변화                     | 데스크탑 baseline 검증된 패턴 — 모바일도 동일 UX 일관성 확보. Mode B 에서도 tap-to-play 경로 (§6.5) 제공.                                                                                                                                                      |
| 4   | Mode B 의 80×45 가 작아 YouTube ToS 향후 갱신 시 위반 가능성                                                  | 픽셀 상수 분리 (`COLLAPSED_VIDEO_WIDTH = 80`, `COLLAPSED_VIDEO_HEIGHT = 45`) → 향후 96×54 등으로 조정 용이. Playwright headed test 가 항상 ≥ 80×45 가드.                                                                                                       |
| 5   | **`useAutoplayGestureGate` (mobile) 와 데스크탑 `video.component.tsx` inline 패턴 의 코드 중복 → 향후 drift** | (a) `AUTOPLAY_DETECT_MS` 상수는 mobile hook 에서 export. 향후 데스크탑이 import 하면 첫 단계 단일화. (b) **chunk 3.1 머지 직후 GH 이슈 신규 등록 — "데스크탑·모바일 autoplay hook 통합 (refactor)"**. PR 본문에 issue ref 포함.                                |
| 6   | **sticky-top 높이 변화 (Mode A↔B, ~210px↔80px) 가 chunk 3 탭 컨테이너 scroll anchor 흔들기**                | (a) chunk 3 tabs 컨테이너가 이미 `flex-1 min-h-0` 라 layout shift 흡수. (b) chat scroll 은 `useChatMessagesScrollManager` 의 bottom-pin 으로 자연 복귀. (c) §7.3 Playwright "Toggle 클릭 후 chat scroll offset 변화 ≤ tolerance" 가 회귀 가드.                 |
| 7   | 데스크탑 `Video.component.tsx` 의 `useAutoResumeOnPause` (블루투스 이어폰 제거 등) 모바일 미적용              | 본 spec OUT — chunk 4 또는 별도. 데스크탑 baseline 우선.                                                                                                                                                                                                       |
| 8   | maintenance 모드 / system-announcement WS overlay 와의 z-index 충돌                                           | display-board 의 sticky-top z 는 chunk 2 의 `z-20`. maintenance overlay 는 더 높은 z (chunk 1·2 의 `WS overlay` 는 일반적으로 `z-50`). 본 spec 은 z 값 미변경. 헤드드 회귀 가드는 §7.3 외 별도 — 향후 모바일 maintenance scenario 가 정의될 때 verify.         |
| 9   | Playwright headed test 의 CI 추가 비용·flakiness                                                              | 단일 mobile UA + 1~2 viewport. 별도 vercel-preview-e2e workflow 의 concurrency 잠금 ([[reference_e2e_preview_alias_race]]) 활용. flakiness 발생 시 단독 재실행으로 격리 가능 여부 진단 절차 미리 plan 에 명시.                                                 |

## 10. 마이그레이션 시나리오

1. chunk 3 PR #357 머지 → `feature/mobile-responsive-spec-3` 가 develop 으로 머지됨.
2. `feature/mobile-responsive-spec-3.1` 신규 브랜치 (origin/develop 기준 분기, [[feedback_branch_from_origin_develop]]).
3. chunk 3.1 plan 작성 (`docs/superpowers/plans/2026-XX-XX-mobile-display-board-tos-redesign.md`).
4. plan-reviewer 통과 후 TDD 실행 (10~12 commits 예상; reviewer 권장 spike 포함).
5. Playwright headed mandatory test 가 CI 에 추가됐는지 확인.
6. PR 생성 (한글 [[feedback_korean_issue_commit_pr]]) → CI green → 머지.
7. release/main 까지 chunk 3 와 묶음 prod ship — **chunk 3.1 가 chunk 3 의 ToS 위반 hotfix 역할이므로 prod ship 직전 필수 게이트**.
8. (post-merge) GH 이슈 신규 등록 — "데스크탑·모바일 autoplay gesture-gate hook 통합 refactor" (§9 risk #5).

## 11. 관련

- 선행 chunk:
  - chunk 1 spec (`docs/superpowers/specs/2026-05-28-mobile-responsive-architecture-design.md`) — §3 chunk 분할, §4 모바일 layout 그림
  - chunk 3 plan (`docs/superpowers/plans/2026-05-29-mobile-responsive-chunk3-chat-crews-tabs.md`)
  - chunk 3 PR `#357`
- 데스크탑 baseline (read-only 참조):
  - `src/widgets/partyroom-display-board/ui/parts/video.component.tsx` (16:9 placeholder + autoplay gate)
  - `src/widgets/partyroom-display-board/ui/parts/use-auto-resume-on-pause.hook.ts` (블루투스 polish, OUT)
- GH 이슈: pfplay-web#340 (모바일 반응형)
- 관련 메모리:
  - [[feedback_pr_series_workflow]] (chunk 3.1 polish follow-up 패턴)
  - [[feedback_branch_from_origin_develop]] (chunk 3.1 분기 정책)
  - [[reference_pfplay_web_local_dev_http_webpack]] (헤드드 검증 환경)
  - [[reference_frontend_playwright_debug]] (Playwright headed measure)
  - [[reference_e2e_preview_alias_race]] (CI flakiness 진단 절차)
  - [[feedback_korean_issue_commit_pr]]
  - [[feedback_autonomous_execution]]
  - [[feedback_elegant_no_code_dirtying]]
  - [[feedback_pfplay_web_i18n_drift]] (chunk 5 i18n catch-up 시 inline 한국어 이주)
  - [[project_mobile_responsive_chunk3_plan_ready]] (chunk 3 entry 메모리)

## 12. 다음

1. spec-document-reviewer 2차 루프 (1차에서 10 issues — 모두 spec 본문에 반영. 잔존 이슈 발견 시 fix 후 재차).
2. 사용자 spec 리뷰.
3. 통과 시 writing-plans skill 으로 plan 작성.
