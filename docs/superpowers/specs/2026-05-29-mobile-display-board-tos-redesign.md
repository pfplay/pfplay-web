# 모바일 디스플레이 보드 — YouTube ToS 보존 재설계 spec

**Date:** 2026-05-29
**Chunk:** chunk 3.1 (chunk 3 polish follow-up — chunk 3 머지 직후 atomic PR)
**Status:** Draft → spec-document-reviewer → 사용자 승인 → writing-plans

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

| #   | 항목              | 결정                                                                                         |
| --- | ----------------- | -------------------------------------------------------------------------------------------- |
| 1   | chunk 구분        | chunk 3 머지 직후 chunk 3.1 후속 PR (atomic, develop 진입)                                   |
| 2   | 재생 중 default   | **Mode A** — 16:9 풀폭 YoutubePlayer + 트랙메타                                              |
| 3   | 비재생 default    | **Mode C** — 16:9 검정 placeholder 박스 (데스크탑 시각 연속성)                               |
| 4   | 축소 토글         | 우상단 ▾ 아이콘 overlay. 클릭 시 Mode A↔Mode B 전환                                         |
| 5   | Collapsed 크기    | **80×45 px** (iOS HIG 44×44 hit-area 근접, ToS 보수) + 트랙명·DJ 가로 row                    |
| 6   | 비재생 시 토글    | hide (가릴 영상 없음) — 항상 Mode C                                                          |
| 7   | State persistence | 룸 입장마다 `expanded=true` reset, component-local `useState`, 트랙 변경 시 자동 expand 없음 |
| 8   | autoplay polish   | 데스크탑 `autoplayBlocked` + gesture gate 패턴 모바일 차용 (동봉)                            |
| 9   | 데스크탑 격리     | 데스크탑 `widgets/partyroom-display-board/*` 변경 0                                          |
| 10  | lobby 카드 디테일 | 본 spec OUT — 별도 후속 결정                                                                 |

## 4. Architecture

### 4.1 변경 영역

| 경로                                                                                    | 변경                                                                                             |
| --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `src/widgets-mobile/partyroom-display-board/partyroom-display-board.component.tsx`      | 본문 대규모 재설계 (4 mode 핸들 + 토글)                                                          |
| `src/widgets-mobile/partyroom-display-board/ui/parts/video-frame.component.tsx`         | 신규 — 16:9 박스 + YoutubePlayer + autoplay gesture gate                                         |
| `src/widgets-mobile/partyroom-display-board/ui/parts/video-frame.component.test.tsx`    | 신규 — 4 mode 회귀 + ToS 가드                                                                    |
| `src/widgets-mobile/partyroom-display-board/ui/parts/expand-toggle.component.tsx`       | 신규 — ▾/◂ 토글 버튼                                                                             |
| `src/widgets-mobile/partyroom-display-board/ui/parts/expand-toggle.component.test.tsx`  | 신규 — 클릭 콜백 + aria                                                                          |
| `src/widgets-mobile/partyroom-display-board/lib/use-autoplay-gesture-gate.hook.ts`      | 신규 — 데스크탑 `use-auto-resume-on-pause.hook.ts` 와 별개. autoplay 차단 감지 + gesture trigger |
| `src/widgets-mobile/partyroom-display-board/lib/use-autoplay-gesture-gate.hook.test.ts` | 신규                                                                                             |

> **데스크탑 `widgets/partyroom-display-board/*` 0 수정** — C3 격리 (sibling 사본 패턴, chunk 2·3 와 동일 정책).

### 4.2 4 mode layout 사양

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

**Mode D (비재생+collapsed) 불가능** — 비재생 시 expanded 강제.

### 4.3 컴포넌트 트리

```
MobilePartyroomDisplayBoard (root, 'use client')
├─ <header> 헤더 row (뒤로 · 룸이름 · ⋮)
│   — chunk 2 그대로
└─ <section className='display-area'>
    ├─ VideoFrame                       ← 신규
    │   ├─ YoutubePlayer (dynamic import)
    │   │   — Mode A: 16:9 풀폭 (aspect-video)
    │   │   — Mode B: 80×45 fixed
    │   │   — Mode C: 미렌더, 대신 BlankPlaceholder
    │   ├─ BlankPlaceholder (Mode C 만)
    │   │   — 16:9 + zZz 아이콘 + "지금 재생 중인 곡이 없어요"
    │   ├─ AutoplayGestureGate
    │   │   — autoplayBlocked && playable && expanded 시 overlay
    │   └─ ExpandToggle (Mode A·B 만, Mode C hide)
    ├─ NowPlayingMeta (Mode A·B 각각 다른 배치)
    │   — Mode A: 박스 아래 column
    │   — Mode B: 박스 우측 row
    └─ ActionButtons (리액션, chunk 2 그대로)
```

### 4.4 State 모델

```tsx
const [expanded, setExpanded] = useState(true); // 룸 입장마다 reset
const [autoplayBlocked, setAutoplayBlocked] = useState(false);
const [played, setPlayed] = useState(false);
const [playerReady, setPlayerReady] = useState(false);

const playbackActivated = useCurrentPartyroom((s) => s.playbackActivated);
const playback = useCurrentPartyroom((s) => s.playback);
const isPlaying = playbackActivated && !!playback?.linkId;

// Mode 결정
const mode: 'A' | 'B' | 'C' = !isPlaying ? 'C' : expanded ? 'A' : 'B';
```

### 4.5 YoutubePlayer 크기 동적 지정

react-player/youtube 는 `width`/`height` prop 으로 크기 지정. Mode A·B 전환 시 prop 만 바꾸고 컴포넌트 unmount/remount 회피 (재생 끊김 방지).

```tsx
<YoutubePlayer
  url={`https://www.youtube.com/watch?v=${playback.linkId}`}
  playing={playerReady}
  volume={muted ? 0 : volume}
  muted={muted}
  width={mode === 'A' ? '100%' : '80px'}
  height={mode === 'A' ? '100%' : '45px'}
  className='bg-black rounded' // hidden 클래스 절대 추가 X
  onReady={onPlayerReady}
  onStart={onStart}
  onPlay={onPlay}
  onPause={onPause}
  config={config}
/>
```

- `key` 에 `videoId`/`endTime` 포함 X (background tab autoplay 차단 회피, [[reference_frontend_playwright_debug]] 및 데스크탑 #341 결정 유지)
- `playerClass` 에 `hidden` 절대 추가 X (ToS 가드)

### 4.6 useAutoplayGestureGate hook

데스크탑의 `useAutoResumeOnPause` 와 별개. 모바일 first-mount 시 autoplay 가 차단됐는지 감지하고 gesture gate UI 표시:

```ts
// Pseudo
function useAutoplayGestureGate({ playerRef, playable }) {
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [played, setPlayed] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);

  // onPlay → played=true, autoplayBlocked=false
  // onReady → playerReady=true, seekToLive
  // 후 AUTOPLAY_DETECT_MS=1500ms 내 onPlay 없으면 autoplayBlocked=true

  const handleGesturePlay = () => {
    playerRef.current?.getInternalPlayer()?.playVideo?.();
    setAutoplayBlocked(false);
  };

  return { autoplayBlocked, played, playerReady, handleGesturePlay /* setters */ };
}
```

본 hook 은 데스크탑 video.component.tsx 의 ll. 73-153 에서 추출한 패턴. 데스크탑 코드는 미수정. 만약 미래에 데스크탑·모바일이 공통 hook 으로 통합되면 그건 별도 리팩토링 작업.

## 5. ToS 보존 검증 포인트

각 항목은 테스트로 회귀 가드 가능.

| 가드 항목                                                                    | 검증 방법                                                         |
| ---------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Mode A: YoutubePlayer width/height 가 '100%' 또는 16:9 비율의 풀폭           | 통합 테스트에서 mock react-player 의 width/height prop 단언       |
| Mode B: YoutubePlayer width ≥ 80px, height ≥ 45px (보수 하한)                | 통합 테스트 단언                                                  |
| Mode C: YoutubePlayer 미렌더 (재생 안 함 → IFrame 불요) — placeholder 박스만 | mode='C' 시 react-player mock 호출 0 회 단언                      |
| 어떤 mode 에서도 `className` 에 `hidden` 토큰 없음                           | className 정규식 단언 (`expect(class).not.toMatch(/\bhidden\b/)`) |
| 어떤 mode 에서도 `opacity-0`, `w-px`, `h-px`, `pointer-events-none` 없음     | className 정규식 단언                                             |
| aria-hidden=true 없음 (screen reader 접근성도 보존)                          | DOM 속성 단언                                                     |

## 6. 컴포넌트 책임 분리

### 6.1 `VideoFrame`

**책임**: 단일 root — 4 mode 중 하나를 렌더. ExpandToggle·BlankPlaceholder·YoutubePlayer·AutoplayGestureGate orchestration.

**Props**:

```ts
interface VideoFrameProps {
  isPlaying: boolean;
  videoId: string | undefined;
  expanded: boolean;
  onToggleExpand: () => void;
}
```

**Mode 분기**:

- `!isPlaying || !videoId` → BlankPlaceholder (Mode C). Toggle hide.
- `expanded` → YoutubePlayer 16:9 + Toggle ▾
- `!expanded` → YoutubePlayer 80×45 + Toggle ◂

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

- `<button>` + `aria-label={expanded ? '영상 가리기' : '영상 펼치기'}`
- `aria-pressed={!expanded}` (collapsed=pressed state)
- min-h-[44px] min-w-[44px] hit-area

### 6.3 `BlankPlaceholder`

**책임**: Mode C 의 16:9 검정 박스 + 안내 텍스트.

**Props**: 없음 (i18n 키 inline).

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

## 7. 테스트 전략

### 7.1 단위 테스트

- `video-frame.component.test.tsx` (8 케이스)
  - Mode A 렌더: YoutubePlayer 호출 (width=100%, height=100%), Toggle ▾, BlankPlaceholder 미렌더
  - Mode B 렌더: YoutubePlayer width=80px height=45px, Toggle ◂
  - Mode C 렌더: BlankPlaceholder visible, YoutubePlayer 미렌더, Toggle hide
  - autoplayBlocked && expanded 시 gesture gate overlay 렌더, 클릭 시 playVideo() 호출
  - ToS 가드: 모든 mode 에서 className 에 `hidden`/`opacity-0`/`w-px`/`h-px` 토큰 부재
  - ToS 가드: Mode B 의 YoutubePlayer 가 width >= 80 & height >= 45 (정수 또는 px 문자열 파싱)
- `expand-toggle.component.test.tsx` (4 케이스)
  - aria-label expanded·collapsed 분기
  - 클릭 시 onToggle 콜백
  - aria-pressed 단언
  - 44×44 hit-area class 단언
- `use-autoplay-gesture-gate.hook.test.ts` (5 케이스)
  - 초기 ready/played/blocked 모두 false
  - onReady 호출 후 playerReady=true + seekToLive 호출
  - 1500ms 내 onPlay 없으면 autoplayBlocked=true
  - onPlay 호출 시 played=true, autoplayBlocked=false
  - handleGesturePlay 가 internal playVideo() 호출

### 7.2 통합 테스트

- `partyroom-display-board.component.test.tsx` (기존 없음, 신규 6 케이스)
  - 룸 mount 시 expanded=true default
  - 토글 클릭 → collapsed (Mode B)
  - 다시 클릭 → expanded (Mode A)
  - playback null → Mode C, toggle hide
  - playback 변경 후에도 expanded state 보존 (자동 expand 없음)
  - 룸 unmount → 다시 mount 시 expanded=true reset (component-local state)

### 7.3 헤드드 검증 (Playwright 사전 smoke)

implementation 후 dev 서버 + Playwright mobile UA 로:

- Mode A·B·C 각 mode 의 IFrame 가시 영역 ≥ 80×45 단언 (getComputedStyle).
- ToS 가드: `getComputedStyle(iframe).visibility !== 'hidden' && opacity !== '0'`.
- 토글 클릭 후 IFrame width 가 80px 로 변하는지 (CSS computed 측정).

## 8. 스코프

### IN

- `widgets-mobile/partyroom-display-board` 본문 재설계
- VideoFrame·ExpandToggle·BlankPlaceholder·NowPlayingMeta 신규 sibling parts
- useAutoplayGestureGate 신규 hook
- 데스크탑 `useUserPreferenceStore` (volume·muted) 재사용 (read-only)
- 데스크탑 `Playback.getInitialSeek` 재사용 (read-only)
- ToS 가드 회귀 테스트

### OUT

- 데스크탑 `widgets/partyroom-display-board/*` 변경 0
- chunk 2 의 `ActionButtons` (리액션) 변경 0
- chunk 3 의 탭·채팅·크루 변경 0
- DJ 큐 (chunk 4)
- lobby 카드 디자인 (별도 결정)
- 사용자가 영상 일부분만 hide 하거나 mute toggle 추가 — v1 스코프 아님 (현 결정은 mute=userPreferenceStore 따라감)
- userPreference 에 expanded 영구 저장 (사용자 결정: session reset)

## 9. 위험 + 트레이드오프

| 위험                                                                                                               | 완화                                                                                                                        |
| ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| Mode A 풀폭 IFrame 이 sticky-top 점유 → 채팅 영역 잠식 (iPhone SE 568px 등 small viewport 에서 메시지 4~5 visible) | 사용자가 collapse 토글로 80×45 Mode B 전환 → 채팅 영역 ~150px 확보                                                          |
| react-player 의 width/height prop 변경이 internal player remount 유발할 가능성                                     | `key` 에 width/height 포함 X. width 만 prop 변경 → react-player 내부 div 리사이즈만 발동, IFrame 재로드 X. 헤드드 검증 필수 |
| autoplay gesture gate UX 가 모바일에 처음 도입 → 새로고침·shortlink 진입 사용자 경험 변화                          | 데스크탑 baseline 검증된 패턴 — 모바일도 동일 UX 일관성 확보                                                                |
| Mode B 의 80×45 가 작아 YouTube ToS 향후 갱신 시 위반 가능성                                                       | 픽셀 상수 분리 (`COLLAPSED_VIDEO_WIDTH = 80`, `COLLAPSED_VIDEO_HEIGHT = 45`) → 향후 96×54 등으로 조정 용이                  |
| 데스크탑 `Video.component.tsx` 의 `useAutoResumeOnPause` (블루투스 이어폰 제거 등) 모바일 미적용                   | 본 spec OUT — chunk 4 또는 별도. 데스크탑 baseline 우선                                                                     |

## 10. 마이그레이션 시나리오

1. chunk 3 머지 → develop `feature/mobile-responsive-spec-3` 가 develop 으로 머지됨
2. `feature/mobile-responsive-spec-3.1` 신규 브랜치 (origin/develop 기준 분기)
3. chunk 3.1 plan 작성 (`docs/superpowers/plans/2026-XX-XX-mobile-display-board-tos-redesign.md`)
4. plan-reviewer 통과 후 TDD 실행 (8~10 commits 예상)
5. PR 생성 (한글 [[feedback_korean_issue_commit_pr]]) → CI green → 머지
6. release/main 까지 chunk 3 와 묶음 prod ship — **chunk 3.1 가 chunk 3 의 ToS 위반 hotfix 역할이므로 prod ship 직전 필수 게이트**

## 11. 관련

- 선행 chunk:
  - chunk 1 spec (`docs/superpowers/specs/2026-05-28-mobile-responsive-architecture-design.md`) — §3 chunk 분할, §4 모바일 layout 그림
  - chunk 3 plan (`docs/superpowers/plans/2026-05-29-mobile-responsive-chunk3-chat-crews-tabs.md`)
- 데스크탑 baseline (read-only 참조):
  - `src/widgets/partyroom-display-board/ui/parts/video.component.tsx` (16:9 placeholder + autoplay gate)
  - `src/widgets/partyroom-display-board/ui/parts/use-auto-resume-on-pause.hook.ts` (블루투스 polish, OUT)
- GH 이슈: pfplay-web#340 (모바일 반응형)
- 관련 메모리:
  - [[feedback_pr_series_workflow]] (chunk 3.1 polish follow-up 패턴)
  - [[reference_pfplay_web_local_dev_http_webpack]] (헤드드 검증 환경)
  - [[reference_frontend_playwright_debug]] (Playwright headed measure)
  - [[feedback_korean_issue_commit_pr]]
  - [[feedback_autonomous_execution]]
  - [[feedback_elegant_no_code_dirtying]]
  - [[project_mobile_responsive_chunk3_plan_ready]] (chunk 3 entry 메모리)

## 12. 다음

1. spec-document-reviewer 루프 (이슈 발견 시 fix 후 재차)
2. 사용자 spec 리뷰
3. 통과 시 writing-plans skill 으로 plan 작성
