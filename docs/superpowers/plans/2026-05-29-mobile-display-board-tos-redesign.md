# 모바일 디스플레이 보드 — YouTube ToS 보존 재설계 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** chunk 2 의 `1px×1px+opacity-0` IFrame 숨김 (YouTube IFrame Player API ToS 위반) 을 풀폭/축소 토글 + 검정 placeholder 3-mode 디자인으로 대체하고, 데스크탑의 autoplay gesture gate 패턴을 모바일에 차용한다.

**Architecture:** 데스크탑 `widgets/partyroom-display-board/*` 는 0 수정 (C3 sibling 사본 패턴). 모바일 widget 의 본문 + 7 신규 parts/hook 으로 3 모드 (A: 풀폭 / B: 80×45 / C: 비재생 placeholder) 를 wrapper-class 기반으로 구현. YoutubePlayer 의 width/height 는 항상 `'100%'` 고정 → wrapper Tailwind class 만 교체 → IFrame remount 차단. `useAutoplayGestureGate` hook 이 root 1 곳에서 호출되어 VideoFrame 내부 AutoplayGestureGate 와 NowPlayingRow 내부 TapToPlayButton 양쪽에 동일 `gate` state 를 props 로 주입 (single source of truth).

**Tech Stack:** Next.js 14 (`'use client'`), TypeScript, Tailwind JIT (정적 class only), react-player/youtube (dynamic import, SSR off), Zustand (`useCurrentPartyroom`, `useUserPreferenceStore`), Vitest + jsdom + React Testing Library (unit/integration), Playwright (headed mandatory CI).

**Spec:** `docs/superpowers/specs/2026-05-29-mobile-display-board-tos-redesign.md` (v4, 16 결정 잠금)

**Branch:** `feature/mobile-responsive-spec-3.1` (origin/development 기준 분기 완료)

---

## File Structure

### 신규 (Create)

| 경로                                                                                        | 책임                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | 약 줄수 |
| ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `src/widgets-mobile/partyroom-display-board/lib/use-autoplay-gesture-gate.hook.ts`          | autoplay 차단 감지 + gesture release 단일 hook. 데스크탑 `video.component.tsx` 의 inline 패턴을 hook 으로 추출한 모바일 사본. `AUTOPLAY_DETECT_MS` 상수 export. `videoId` 변경 시 차단 re-arm.                                                                                                                                                                                                                                                                                                                                                             | ~80     |
| `src/widgets-mobile/partyroom-display-board/lib/use-autoplay-gesture-gate.hook.test.ts`     | hook 8 케이스 (`AUTOPLAY_DETECT_MS` 상수 단언 + spec §7.1 7 케이스: 초기 state · onReady · 1500ms timeout · onPlay reset · handleGesturePlay · videoId 변경 re-arm · playable=false reset)                                                                                                                                                                                                                                                                                                                                                                 | ~180    |
| `src/widgets-mobile/partyroom-display-board/ui/parts/blank-placeholder.component.tsx`       | Mode C 의 16:9 검정 박스 + inline 한국어 안내 텍스트 ("지금 재생 중인 곡이 없어요"). Props 없음.                                                                                                                                                                                                                                                                                                                                                                                                                                                           | ~25     |
| `src/widgets-mobile/partyroom-display-board/ui/parts/blank-placeholder.component.test.tsx`  | 텍스트 / aspect-video class / data-testid 단언 (3 케이스)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | ~40     |
| `src/widgets-mobile/partyroom-display-board/ui/parts/expand-toggle.component.tsx`           | ▾/◂ 버튼. `expanded` + `onToggle` props. `aria-label` 분기, `aria-pressed={!expanded}`, `min-h-[44px] min-w-[44px]`.                                                                                                                                                                                                                                                                                                                                                                                                                                       | ~30     |
| `src/widgets-mobile/partyroom-display-board/ui/parts/expand-toggle.component.test.tsx`      | aria-label expanded/collapsed 분기, 클릭 콜백, aria-pressed, 44×44 hit-area, positioning 부재 회귀 (5 케이스)                                                                                                                                                                                                                                                                                                                                                                                                                                              | ~75     |
| `src/widgets-mobile/partyroom-display-board/ui/parts/now-playing-meta.component.tsx`        | 트랙명·DJ·duration. `layout: 'column' \| 'row'` props.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | ~40     |
| `src/widgets-mobile/partyroom-display-board/ui/parts/now-playing-meta.component.test.tsx`   | column 렌더, row 렌더, dj null 처리, layout 분기 class, parent flex 토큰 부재 회귀 (5 케이스)                                                                                                                                                                                                                                                                                                                                                                                                                                                              | ~75     |
| `src/widgets-mobile/partyroom-display-board/ui/parts/tap-to-play-button.component.tsx`      | Mode B 의 release ▶ 버튼. `autoplayBlocked` && `!played` 시만 visible. 44×44 hit-area, `aria-label='재생'`.                                                                                                                                                                                                                                                                                                                                                                                                                                               | ~30     |
| `src/widgets-mobile/partyroom-display-board/ui/parts/tap-to-play-button.component.test.tsx` | 차단 visible, 비차단 미렌더, 클릭 콜백, aria, hit-area (4 케이스)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | ~60     |
| `src/widgets-mobile/partyroom-display-board/ui/parts/video-frame.component.tsx`             | 3 mode orchestrator. wrapperClass(mode) 정적 리터럴 분기. YoutubePlayer (Mode A·B) + BlankPlaceholder (Mode C) + AutoplayGestureGate (Mode A 만 overlay) + ExpandToggle (Mode A·B). Constants export: `COLLAPSED_VIDEO_WIDTH`, `COLLAPSED_VIDEO_HEIGHT`.                                                                                                                                                                                                                                                                                                   | ~150    |
| `src/widgets-mobile/partyroom-display-board/ui/parts/video-frame.component.test.tsx`        | 14 케이스 — VideoFrame 단일 컴포넌트 범위 (Mode A/B/C 렌더 3, 전환 4 (A↔B remount X, B↔C / C↔A / A↔C mount/unmount), autoplay overlay Mode A only 1, Mode B AutoplayGestureGate 미렌더 1, wrapperClass Mode B 정적 리터럴 1, JS 상수 ↔ wrapperClass sync 1, ToS 가드 2 회귀, videoId=null Props 안전 1). spec §7.1 의 cross-component 케이스 2건 (TapToPlayButton 렌더 위치, Mode B→A toggle 시 GestureGate single source) 은 Chunk 4 integration test 로 이전 — VideoFrame 단독 테스트로 검증 불가능 (TapToPlayButton 은 NowPlayingRow 소속, §6.5.3) | ~340    |
| `src/widgets-mobile/partyroom-display-board/partyroom-display-board.component.test.tsx`     | 통합 테스트 12 케이스 (spec §7.2 list 10 + VideoFrame test 에서 이전한 cross-component 2: TapToPlayButton 가 NowPlayingRow 안 렌더 + Mode B autoplay → Mode A toggle 시 GestureGate 즉시 visible single source). spec §7.2 의 header `(9 케이스)` 는 outdated — 실제 list 는 10.                                                                                                                                                                                                                                                                           | ~330    |

### 수정 (Modify)

| 경로                                                                               | 변경 요약                                                                                                                                                                                                                                             |
| ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/widgets-mobile/partyroom-display-board/partyroom-display-board.component.tsx` | 본문 대규모 재설계: `useAutoplayGestureGate` 호출 (root), `<VideoFrame gate={…} />` mount, NowPlayingRow (`min-h-[44px]`) + `<TapToPlayButton />` sibling. 기존 1px IFrame 본문 / inline now-playing 텍스트 / 헤더 row 일부 흡수. ActionButtons 유지. |
| `playwright.config.ts`                                                             | `display-board.tos` project 추가 (mobile viewport — iPhone 13/SE/Pixel 7). `e2e/mobile/` testMatch.                                                                                                                                                   |
| `.github/workflows/vercel-preview-e2e.yml`                                         | mandatory job 명시 (현재 단일 `e2e` job 이라 추가 변경 최소; `yarn test:e2e` 가 신규 project 도 자동 포함되므로 README/주석 보강 + 사용자 단발 GitHub UI 작업 안내)                                                                                   |
| `e2e/README.md`                                                                    | 신규 mobile project 안내 + branch protection required check 등록 안내                                                                                                                                                                                 |

### 신규 e2e

| 경로                                   | 책임                                                                                                                                                                                                                                                                                                              | 약 줄수 |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `e2e/mobile/display-board.tos.spec.ts` | Playwright headed mandatory test. Mode A 진입 IFrame visible + boundingBox ≥ 80×45 + computed style 단언, Toggle → Mode B (80×45 정확값) + 같은 IFrame element, Mode B → A 복귀 시 IFrame remount 없음, Mode C BlankPlaceholder visible + IFrame 미존재, chat scroll offset ≤ `CHAT_SCROLL_TOLERANCE_PX=10` 보존. | ~280    |

### 디렉토리 합계

- 신규: hook 1 + parts 6 + e2e 1 + test 8 = 16 files (~1650 lines)
- 수정: 4 files
- 데스크탑 0 수정

---

## Chunk 1: useAutoplayGestureGate Hook (Foundation)

> 본 chunk 는 root 와 VideoFrame 양쪽이 의존하는 단일 상태 hook 을 TDD 로 먼저 만든다. Hook 은 데스크탑 `video.component.tsx:73-153` 의 inline 패턴 추출본이지만 데스크탑은 그대로 둔다 (C3 격리, §3 row 9). 본 chunk 가 완료되면 Chunk 2·3·4 가 모두 본 hook 의 단언된 인터페이스에 기반해 작성된다.

### Task 1.1: 디렉토리 + 빈 hook stub 생성

**Files:**

- Create: `src/widgets-mobile/partyroom-display-board/lib/use-autoplay-gesture-gate.hook.ts`

- [ ] **Step 1: 디렉토리 / 빈 hook + 상수 export stub 작성**

파일 작성:

```ts
// src/widgets-mobile/partyroom-display-board/lib/use-autoplay-gesture-gate.hook.ts
import type { RefObject } from 'react';
import type TReactPlayer from 'react-player';

export const AUTOPLAY_DETECT_MS = 1500;

interface UseAutoplayGestureGateArgs {
  playerRef: RefObject<TReactPlayer | null>;
  playable: boolean;
  videoId: string | null;
}

export interface AutoplayGestureGate {
  autoplayBlocked: boolean;
  played: boolean;
  playerReady: boolean;
  handleGesturePlay: () => void;
  onReady: (player: TReactPlayer) => void;
  onStart: () => void;
  onPlay: () => void;
  onPause: () => void;
}

export default function useAutoplayGestureGate(
  _args: UseAutoplayGestureGateArgs
): AutoplayGestureGate {
  throw new Error('not implemented');
}
```

- [ ] **Step 2: TypeScript build sanity check**

> 본 레포 (pfplay-web) 는 JDK 의존 없음. `JAVA_HOME` prefix 는 적용 영역 아님 (참고: [[reference_pfplay_platform_jdk]] 는 pfplay-platform 전용).

Run: `yarn tsc --noEmit -p tsconfig.json 2>&1 | tail -10`
Expected: 0 errors (stub 만 있어서 통과)

- [ ] **Step 3: Commit stub**

```bash
git add src/widgets-mobile/partyroom-display-board/lib/use-autoplay-gesture-gate.hook.ts
git commit -m "feat(widgets-mobile/partyroom-display-board): useAutoplayGestureGate hook stub + 인터페이스 + AUTOPLAY_DETECT_MS 상수"
```

### Task 1.2: 초기 state 단언 테스트 (RED)

**Files:**

- Create: `src/widgets-mobile/partyroom-display-board/lib/use-autoplay-gesture-gate.hook.test.ts`

- [ ] **Step 1: 테스트 파일 작성 — `초기 state 는 모두 false`**

```ts
// src/widgets-mobile/partyroom-display-board/lib/use-autoplay-gesture-gate.hook.test.ts
/**
 * @vitest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { useRef } from 'react';
import { describe, expect, test } from 'vitest';
import type TReactPlayer from 'react-player';
import useAutoplayGestureGate, { AUTOPLAY_DETECT_MS } from './use-autoplay-gesture-gate.hook';

function setupHook({
  playable = true,
  videoId = 'abc' as string | null,
}: { playable?: boolean; videoId?: string | null } = {}) {
  return renderHook(() => {
    const playerRef = useRef<TReactPlayer | null>(null);
    return useAutoplayGestureGate({ playerRef, playable, videoId });
  });
}

describe('useAutoplayGestureGate', () => {
  test('AUTOPLAY_DETECT_MS = 1500 (spec §4.6, ms)', () => {
    expect(AUTOPLAY_DETECT_MS).toBe(1500);
  });

  test('초기 state: autoplayBlocked / played / playerReady 모두 false', () => {
    const { result } = setupHook();
    expect(result.current.autoplayBlocked).toBe(false);
    expect(result.current.played).toBe(false);
    expect(result.current.playerReady).toBe(false);
  });
});
```

- [ ] **Step 2: 테스트 실행 → RED 확인**

Run: `yarn vitest run src/widgets-mobile/partyroom-display-board/lib/use-autoplay-gesture-gate.hook.test.ts 2>&1 | tail -30`
Expected: 2 tests, `초기 state` 가 FAIL (`'not implemented'` throw). `AUTOPLAY_DETECT_MS` 는 PASS.

- [ ] **Step 3: hook 본문 — useState 3 개 + return 만 구현**

`use-autoplay-gesture-gate.hook.ts` 본문 교체:

```ts
import { useState, type RefObject } from 'react';
import type TReactPlayer from 'react-player';

export const AUTOPLAY_DETECT_MS = 1500;

interface UseAutoplayGestureGateArgs {
  playerRef: RefObject<TReactPlayer | null>;
  playable: boolean;
  videoId: string | null;
}

export interface AutoplayGestureGate {
  autoplayBlocked: boolean;
  played: boolean;
  playerReady: boolean;
  handleGesturePlay: () => void;
  onReady: (player: TReactPlayer) => void;
  onStart: () => void;
  onPlay: () => void;
  onPause: () => void;
}

export default function useAutoplayGestureGate({
  playerRef,
}: UseAutoplayGestureGateArgs): AutoplayGestureGate {
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [played, setPlayed] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);

  const handleGesturePlay = () => {
    const internal = playerRef.current?.getInternalPlayer() as
      | { playVideo?: () => void }
      | undefined;
    internal?.playVideo?.();
    setAutoplayBlocked(false);
  };

  const onReady = (_player: TReactPlayer) => {
    setPlayerReady(true);
  };

  const onStart = () => {
    /* seekToLive 는 VideoFrame 의 외부 콜백에서 처리 (data 의존) */
  };

  const onPlay = () => {
    setPlayed(true);
    setAutoplayBlocked(false);
  };

  const onPause = () => {
    /* 본 hook 은 onPause 의 자동 재개 폴백을 수행 안 함 (chunk 3.1 OUT, §9 risk #7) */
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
```

- [ ] **Step 4: 테스트 GREEN 확인**

Run: `yarn vitest run src/widgets-mobile/partyroom-display-board/lib/use-autoplay-gesture-gate.hook.test.ts 2>&1 | tail -20`
Expected: 2 tests passed.

- [ ] **Step 5: Commit**

```bash
git add src/widgets-mobile/partyroom-display-board/lib/use-autoplay-gesture-gate.hook.ts \
        src/widgets-mobile/partyroom-display-board/lib/use-autoplay-gesture-gate.hook.test.ts
git commit -m "test(widgets-mobile/partyroom-display-board): useAutoplayGestureGate 초기 state + 상수 단언

feat: useState 3개 + handleGesturePlay/onReady/onPlay 기본 구현"
```

### Task 1.3: onReady → playerReady=true (RED→GREEN)

**Files:**

- Modify: `src/widgets-mobile/partyroom-display-board/lib/use-autoplay-gesture-gate.hook.test.ts`

- [ ] **Step 1: 테스트 추가**

`describe('useAutoplayGestureGate', () => { ... })` 안에 추가:

```ts
test('onReady 호출 시 playerReady=true 로 전이', () => {
  const { result } = setupHook();
  const fakePlayer = {} as TReactPlayer;
  // act 으로 감싸 React state update 반영
  act(() => result.current.onReady(fakePlayer));
  expect(result.current.playerReady).toBe(true);
});
```

import 에 `act` 추가:

```ts
import { act, renderHook } from '@testing-library/react';
```

- [ ] **Step 2: 테스트 실행 → 즉시 GREEN (이미 onReady 가 setPlayerReady 호출)**

Run: `yarn vitest run src/widgets-mobile/partyroom-display-board/lib/use-autoplay-gesture-gate.hook.test.ts 2>&1 | tail -20`
Expected: 3 tests passed.

- [ ] **Step 3: Commit**

```bash
git add src/widgets-mobile/partyroom-display-board/lib/use-autoplay-gesture-gate.hook.test.ts
git commit -m "test(widgets-mobile/partyroom-display-board): useAutoplayGestureGate onReady → playerReady 단언"
```

### Task 1.4: 1500ms timer → autoplayBlocked=true (RED→GREEN)

**Files:**

- Modify: `src/widgets-mobile/partyroom-display-board/lib/use-autoplay-gesture-gate.hook.ts`
- Modify: `src/widgets-mobile/partyroom-display-board/lib/use-autoplay-gesture-gate.hook.test.ts`

- [ ] **Step 1: 테스트 추가 (fake timer)**

테스트 파일의 import 블록 끝 (마지막 `import …` 라인 직후, `function setupHook(...)` / `describe(...)` 보다 위) 에 vi 추가:

```ts
import { act, renderHook } from '@testing-library/react';
import { useRef } from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import type TReactPlayer from 'react-player';
import useAutoplayGestureGate, { AUTOPLAY_DETECT_MS } from './use-autoplay-gesture-gate.hook';
```

그리고 마지막 import 직후, `function setupHook(...)` 보다 위 top-level 위치에:

```ts
beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
});
```

describe 안에 케이스 추가:

```ts
test('onReady 후 1500ms 내 onPlay 없으면 autoplayBlocked=true', () => {
  const { result } = setupHook();
  act(() => result.current.onReady({} as TReactPlayer));
  act(() => {
    vi.advanceTimersByTime(AUTOPLAY_DETECT_MS);
  });
  expect(result.current.autoplayBlocked).toBe(true);
});
```

- [ ] **Step 2: 테스트 실행 → RED (timer effect 가 hook 에 없음)**

Run: `yarn vitest run src/widgets-mobile/partyroom-display-board/lib/use-autoplay-gesture-gate.hook.test.ts 2>&1 | tail -20`
Expected: 1 fail — `autoplayBlocked === false`.

- [ ] **Step 3: hook 본문에 useEffect 추가**

`use-autoplay-gesture-gate.hook.ts` 의 `useState` 3개 뒤, return 전에:

```ts
import { useEffect, useState, type RefObject } from 'react';
// ... 기존 import 유지

useEffect(() => {
  if (!playerReady || played) return;
  const timer = setTimeout(() => setAutoplayBlocked(true), AUTOPLAY_DETECT_MS);
  return () => clearTimeout(timer);
}, [playerReady, played, videoId]);
```

args destructure 도 확장:

```ts
{ playerRef, playable, videoId }: UseAutoplayGestureGateArgs
```

- [ ] **Step 4: 테스트 GREEN 확인**

Run: `yarn vitest run src/widgets-mobile/partyroom-display-board/lib/use-autoplay-gesture-gate.hook.test.ts 2>&1 | tail -20`
Expected: 4 tests passed.

- [ ] **Step 5: Commit**

```bash
git add src/widgets-mobile/partyroom-display-board/lib/use-autoplay-gesture-gate.hook.ts \
        src/widgets-mobile/partyroom-display-board/lib/use-autoplay-gesture-gate.hook.test.ts
git commit -m "test(widgets-mobile/partyroom-display-board): autoplay 1500ms 차단 감지

feat: useEffect timer — playerReady && !played 후 AUTOPLAY_DETECT_MS 경과 시 autoplayBlocked=true"
```

### Task 1.5: onPlay → played=true + autoplayBlocked=false (RED→GREEN)

**Files:**

- Modify: `src/widgets-mobile/partyroom-display-board/lib/use-autoplay-gesture-gate.hook.test.ts`

- [ ] **Step 1: 테스트 추가**

```ts
test('onPlay 호출 시 played=true + autoplayBlocked=false', () => {
  const { result } = setupHook();
  act(() => result.current.onReady({} as TReactPlayer));
  act(() => {
    vi.advanceTimersByTime(AUTOPLAY_DETECT_MS);
  });
  expect(result.current.autoplayBlocked).toBe(true);
  act(() => result.current.onPlay());
  expect(result.current.played).toBe(true);
  expect(result.current.autoplayBlocked).toBe(false);
});
```

- [ ] **Step 2: 테스트 실행 → GREEN (이미 구현됨)**

Run: `yarn vitest run src/widgets-mobile/partyroom-display-board/lib/use-autoplay-gesture-gate.hook.test.ts 2>&1 | tail -20`
Expected: 5 tests passed.

- [ ] **Step 3: Commit**

```bash
git add src/widgets-mobile/partyroom-display-board/lib/use-autoplay-gesture-gate.hook.test.ts
git commit -m "test(widgets-mobile/partyroom-display-board): onPlay 차단 해제 회귀"
```

### Task 1.6: handleGesturePlay → playVideo() (RED→GREEN)

**Files:**

- Modify: `src/widgets-mobile/partyroom-display-board/lib/use-autoplay-gesture-gate.hook.test.ts`

- [ ] **Step 1: 테스트 추가 (mock player + handleGesturePlay)**

```ts
test('handleGesturePlay 가 internal playVideo() 호출 + autoplayBlocked=false 즉시 전환', () => {
  const playVideo = vi.fn();
  const fakePlayer = {
    getInternalPlayer: () => ({ playVideo }),
  } as unknown as TReactPlayer;

  // playerRef 에 직접 fakePlayer 할당하기 위해 renderHook 안에서 ref 노출
  const { result } = renderHook(() => {
    const playerRef = useRef<TReactPlayer | null>(fakePlayer);
    return {
      gate: useAutoplayGestureGate({ playerRef, playable: true, videoId: 'abc' }),
      playerRef,
    };
  });

  // 차단 상태 시뮬레이션
  act(() => result.current.gate.onReady(fakePlayer));
  act(() => vi.advanceTimersByTime(AUTOPLAY_DETECT_MS));
  expect(result.current.gate.autoplayBlocked).toBe(true);

  act(() => result.current.gate.handleGesturePlay());
  expect(playVideo).toHaveBeenCalledTimes(1);
  expect(result.current.gate.autoplayBlocked).toBe(false);
});
```

- [ ] **Step 2: 테스트 실행 → GREEN (이미 구현됨)**

Run: `yarn vitest run src/widgets-mobile/partyroom-display-board/lib/use-autoplay-gesture-gate.hook.test.ts 2>&1 | tail -20`
Expected: 6 tests passed.

- [ ] **Step 3: Commit**

```bash
git add src/widgets-mobile/partyroom-display-board/lib/use-autoplay-gesture-gate.hook.test.ts
git commit -m "test(widgets-mobile/partyroom-display-board): handleGesturePlay internal.playVideo() 호출 단언"
```

### Task 1.7: videoId 변경 시 차단 detect 재armed (RED→GREEN)

**Files:**

- Modify: `src/widgets-mobile/partyroom-display-board/lib/use-autoplay-gesture-gate.hook.test.ts`

- [ ] **Step 1: 테스트 추가 (videoId 변경 → played reset + 새 1500ms 타이머)**

```ts
test('videoId 변경 시 played reset + 새 1500ms 타이머 시작 (트랙 변경 시 차단 재armed)', () => {
  let id = 'first' as string | null;
  const { result, rerender } = renderHook(() => {
    const playerRef = useRef<TReactPlayer | null>(null);
    return useAutoplayGestureGate({ playerRef, playable: true, videoId: id });
  });

  act(() => result.current.onReady({} as TReactPlayer));
  act(() => result.current.onPlay());
  expect(result.current.played).toBe(true);
  expect(result.current.autoplayBlocked).toBe(false);

  // 트랙 변경
  id = 'second';
  rerender();

  // played reset 됨
  expect(result.current.played).toBe(false);

  // 새 트랙도 1500ms 내 onPlay 없으면 차단
  act(() => vi.advanceTimersByTime(AUTOPLAY_DETECT_MS));
  expect(result.current.autoplayBlocked).toBe(true);
});
```

- [ ] **Step 2: 테스트 실행 → RED (videoId 변경 시 played reset 로직 없음)**

Run: `yarn vitest run src/widgets-mobile/partyroom-display-board/lib/use-autoplay-gesture-gate.hook.test.ts 2>&1 | tail -20`
Expected: 1 fail — `played` 가 여전히 true.

- [ ] **Step 3: hook 본문에 videoId reset useEffect 추가**

`use-autoplay-gesture-gate.hook.ts` 의 기존 timer useEffect 위쪽에:

```ts
// 트랙 변경 시 played + autoplayBlocked reset → 새 트랙의 autoplay 차단을 재감지.
useEffect(() => {
  setPlayed(false);
  setAutoplayBlocked(false);
}, [videoId]);
```

- [ ] **Step 4: 테스트 GREEN 확인**

Run: `yarn vitest run src/widgets-mobile/partyroom-display-board/lib/use-autoplay-gesture-gate.hook.test.ts 2>&1 | tail -20`
Expected: 7 tests passed.

- [ ] **Step 5: Commit**

```bash
git add src/widgets-mobile/partyroom-display-board/lib/use-autoplay-gesture-gate.hook.ts \
        src/widgets-mobile/partyroom-display-board/lib/use-autoplay-gesture-gate.hook.test.ts
git commit -m "test(widgets-mobile/partyroom-display-board): videoId 변경 시 차단 detect 재armed

feat: videoId effect — played/autoplayBlocked reset → 새 트랙 1500ms 타이머 재시작 (spec §4.6 reviewer 1차 #7)"
```

### Task 1.8: playable=false 진입 시 state reset (Mode C 시뮬레이션, RED→GREEN)

**Files:**

- Modify: `src/widgets-mobile/partyroom-display-board/lib/use-autoplay-gesture-gate.hook.test.ts`

- [ ] **Step 1: 테스트 추가**

```ts
test('playable=false 진입 시 모든 state reset (Mode C 진입 시 cleanup)', () => {
  let playable = true;
  const { result, rerender } = renderHook(() => {
    const playerRef = useRef<TReactPlayer | null>(null);
    return useAutoplayGestureGate({ playerRef, playable, videoId: 'abc' });
  });

  act(() => result.current.onReady({} as TReactPlayer));
  act(() => result.current.onPlay());
  expect(result.current.playerReady).toBe(true);
  expect(result.current.played).toBe(true);

  // Mode C 진입 시뮬레이션
  playable = false;
  rerender();

  expect(result.current.playerReady).toBe(false);
  expect(result.current.played).toBe(false);
  expect(result.current.autoplayBlocked).toBe(false);
});
```

- [ ] **Step 2: 테스트 실행 → RED**

Run: `yarn vitest run src/widgets-mobile/partyroom-display-board/lib/use-autoplay-gesture-gate.hook.test.ts 2>&1 | tail -20`
Expected: 1 fail — `playerReady` 가 여전히 true.

- [ ] **Step 3: hook 본문에 playable cleanup useEffect 추가**

`use-autoplay-gesture-gate.hook.ts` 에 추가:

```ts
// Mode C (재생 가능 영상 없음) 진입 시 모든 state reset → 다음 재생 시 깨끗한 detect.
useEffect(() => {
  if (!playable) {
    setPlayerReady(false);
    setPlayed(false);
    setAutoplayBlocked(false);
  }
}, [playable]);
```

- [ ] **Step 4: 테스트 GREEN 확인**

Run: `yarn vitest run src/widgets-mobile/partyroom-display-board/lib/use-autoplay-gesture-gate.hook.test.ts 2>&1 | tail -20`
Expected: 8 tests passed (7 spec + 1 상수).

> Note: spec §7.1 의 hook 7 케이스 + `AUTOPLAY_DETECT_MS` 상수 단언 1 케이스 = 총 8 케이스 (Spec 의 "7 케이스" 는 상수 단언을 포함하지 않은 카운트).

- [ ] **Step 5: Commit**

```bash
git add src/widgets-mobile/partyroom-display-board/lib/use-autoplay-gesture-gate.hook.ts \
        src/widgets-mobile/partyroom-display-board/lib/use-autoplay-gesture-gate.hook.test.ts
git commit -m "test(widgets-mobile/partyroom-display-board): playable=false 진입 시 state reset

feat: playable effect — Mode C 진입 시 playerReady/played/autoplayBlocked 모두 false 로 cleanup (spec §7.1)"
```

### Task 1.9: Chunk 1 회귀 + lint 확인

- [ ] **Step 1: hook 테스트 전체 재실행**

Run: `yarn vitest run src/widgets-mobile/partyroom-display-board/lib/ 2>&1 | tail -20`
Expected: 8 tests passed, 1 test file.

- [ ] **Step 2: 프로젝트 전체 lint (변경 파일만 빠른 path)**

Run: `yarn lint --fix src/widgets-mobile/partyroom-display-board/lib/ 2>&1 | tail -20`
Expected: 0 errors (warning 있어도 본 chunk 한정 회귀 0).

- [ ] **Step 3: TypeScript build sanity**

Run: `yarn tsc --noEmit -p tsconfig.json 2>&1 | tail -10`
Expected: 0 errors.

- [ ] **Step 4: 누락 commit 확인**

Run: `git status --short`
Expected: empty (모든 변경 commit 됨).

> **Chunk 1 완료.** Chunk 2 로 진행.

---

## Chunk 2: 정적 Parts — BlankPlaceholder · ExpandToggle · NowPlayingMeta · TapToPlayButton

> 본 chunk 는 VideoFrame 의 leaf 컴포넌트 4 개를 TDD 로 독립 작성한다. Chunk 3 의 VideoFrame 이 이들을 props 로만 의존하도록 인터페이스를 잠근다. inline 한국어 (§3 row 11), 44×44 hit-area (iOS HIG, §3 row 5/6), aria-\* 정합 (§6.2/§6.5) 가 본 chunk 의 핵심 회귀 가드.

> **책임 분리 잠금 (chunk 2 전체 적용)**:
>
> - **wrapper class 는 VideoFrame (Chunk 3) 단일 소유.** BlankPlaceholder 는 wrapper 내부 fill (`w-full h-full`) 만 책임 — `aspect-video`/`bg-black`/`rounded` 토큰을 중첩하지 않는다 (nested aspect-video 회피).
> - **positioning 도 parent (VideoFrame/NowPlayingRow) 단일 소유.** ExpandToggle / TapToPlayButton 의 leaf 본문은 visual + 44×44 hit-area + aria 만. `absolute`/`top-1 right-1`/`flex-1 min-w-0` 같은 부모-context-의존 토큰 금지.
> - **overlay 시각 styling (영상 위 대비/배경/rounded) 도 parent 책임.** ExpandToggle 가 영상 위에 얹히는 가독성 확보 (`bg-black/40`, `rounded-full`, padding 등) 는 Chunk 3 VideoFrame 의 wrapping div 가 가진다. leaf 는 transparent 가정 — 부모 wrapper 가 시각 컨텍스트를 결정.
> - **NowPlayingMeta `layout` prop 의미**: 메타 _내부_ 배치 (column = 트랙/DJ/duration 세 줄 stack, row = 한 줄 inline). spec §4.2 Mode B 의 스케치는 video-box + meta 의 _외부_ 배치 시각화 — 외부 배치는 root MobilePartyroomDisplayBoard 의 NowPlayingRow 가 책임 (§4.4 / §6.4 / Chunk 4).

### Task 2.1: BlankPlaceholder (Mode C 검정 박스)

**Files:**

- Create: `src/widgets-mobile/partyroom-display-board/ui/parts/blank-placeholder.component.tsx`
- Create: `src/widgets-mobile/partyroom-display-board/ui/parts/blank-placeholder.component.test.tsx`

- [ ] **Step 1: 테스트 작성 (RED 3 케이스)**

```tsx
// src/widgets-mobile/partyroom-display-board/ui/parts/blank-placeholder.component.test.tsx
/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import BlankPlaceholder from './blank-placeholder.component';

describe('BlankPlaceholder', () => {
  test('inline 한국어 안내 텍스트 렌더 (spec §6.3, §3 row 11)', () => {
    render(<BlankPlaceholder />);
    expect(screen.getByText('지금 재생 중인 곡이 없어요')).toBeTruthy();
  });

  test('wrapper-fill class (w-full h-full + center) — wrapper aspect 책임은 VideoFrame', () => {
    const { container } = render(<BlankPlaceholder />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toMatch(/\bw-full\b/);
    expect(root.className).toMatch(/\bh-full\b/);
    expect(root.className).toMatch(/\bflex\b/);
    expect(root.className).toMatch(/\bitems-center\b/);
    expect(root.className).toMatch(/\bjustify-center\b/);
    // 회귀 가드: BlankPlaceholder 자체에 aspect-video / bg-black / rounded 가 들어오면 nested 발생
    expect(root.className).not.toMatch(/\baspect-video\b/);
    expect(root.className).not.toMatch(/\bbg-black\b/);
    expect(root.className).not.toMatch(/\brounded\b/);
  });

  test('data-testid="blank-placeholder" 단언 (통합 테스트 selector 안정성)', () => {
    render(<BlankPlaceholder />);
    expect(screen.getByTestId('blank-placeholder')).toBeTruthy();
  });
});
```

- [ ] **Step 2: 테스트 실행 → RED**

Run: `yarn vitest run src/widgets-mobile/partyroom-display-board/ui/parts/blank-placeholder.component.test.tsx 2>&1 | tail -20`
Expected: 3 fail — `Cannot find module './blank-placeholder.component'`.

- [ ] **Step 3: 컴포넌트 구현**

```tsx
// src/widgets-mobile/partyroom-display-board/ui/parts/blank-placeholder.component.tsx
import { FC } from 'react';

/**
 * Mode C (비재생) 안내 — inline 한국어 (spec §6.3, §3 row 11).
 *
 * **책임 분리**: 16:9 aspect / 검정 배경 / rounded 는 VideoFrame 의 wrapperClass('C')
 * 가 책임. 본 컴포넌트는 그 wrapper 의 *fill* (w-full h-full) + 중앙 정렬 + 텍스트만.
 * 중복 토큰을 두면 nested aspect-video / 중첩 bg-black 회귀 발생.
 *
 * Text styling: 기존 chunk 2 inline 의 `text-sm text-gray-500` 패턴 유지 (시각 회귀 0).
 */
const BlankPlaceholder: FC = () => {
  return (
    <div data-testid='blank-placeholder' className='w-full h-full flex items-center justify-center'>
      <p className='text-sm text-gray-500'>지금 재생 중인 곡이 없어요</p>
    </div>
  );
};

export default BlankPlaceholder;
```

- [ ] **Step 4: 테스트 GREEN 확인**

Run: `yarn vitest run src/widgets-mobile/partyroom-display-board/ui/parts/blank-placeholder.component.test.tsx 2>&1 | tail -20`
Expected: 3 tests passed.

- [ ] **Step 5: Commit**

```bash
git add src/widgets-mobile/partyroom-display-board/ui/parts/blank-placeholder.component.tsx \
        src/widgets-mobile/partyroom-display-board/ui/parts/blank-placeholder.component.test.tsx
git commit -m "feat(widgets-mobile/partyroom-display-board): BlankPlaceholder — Mode C 16:9 검정 박스 + 한국어 안내 (spec §6.3)"
```

### Task 2.2: ExpandToggle (▾/◂ 버튼)

**Files:**

- Create: `src/widgets-mobile/partyroom-display-board/ui/parts/expand-toggle.component.tsx`
- Create: `src/widgets-mobile/partyroom-display-board/ui/parts/expand-toggle.component.test.tsx`

- [ ] **Step 1: 테스트 작성 (RED 5 케이스)**

```tsx
// src/widgets-mobile/partyroom-display-board/ui/parts/expand-toggle.component.test.tsx
/**
 * @vitest-environment jsdom
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import ExpandToggle from './expand-toggle.component';

describe('ExpandToggle', () => {
  test('expanded=true 시 aria-label="영상 가리기" + aria-pressed="false" (spec §6.2)', () => {
    render(<ExpandToggle expanded={true} onToggle={() => {}} />);
    const btn = screen.getByRole('button');
    expect(btn.getAttribute('aria-label')).toBe('영상 가리기');
    expect(btn.getAttribute('aria-pressed')).toBe('false');
  });

  test('expanded=false 시 aria-label="영상 펼치기" + aria-pressed="true"', () => {
    render(<ExpandToggle expanded={false} onToggle={() => {}} />);
    const btn = screen.getByRole('button');
    expect(btn.getAttribute('aria-label')).toBe('영상 펼치기');
    expect(btn.getAttribute('aria-pressed')).toBe('true');
  });

  test('클릭 시 onToggle 콜백 1회 호출', () => {
    const onToggle = vi.fn();
    render(<ExpandToggle expanded={true} onToggle={onToggle} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  test('44×44 hit-area class — min-h-[44px] + min-w-[44px] (iOS HIG, spec §6.2)', () => {
    render(<ExpandToggle expanded={true} onToggle={() => {}} />);
    const btn = screen.getByRole('button');
    expect(btn.className).toMatch(/\bmin-h-\[44px\]/);
    expect(btn.className).toMatch(/\bmin-w-\[44px\]/);
  });

  test('positioning 책임은 parent (VideoFrame) — leaf 본문은 absolute/top-*/right-* 미보유', () => {
    render(<ExpandToggle expanded={true} onToggle={() => {}} />);
    const btn = screen.getByRole('button');
    expect(btn.className).not.toMatch(/\babsolute\b/);
    expect(btn.className).not.toMatch(/\btop-/);
    expect(btn.className).not.toMatch(/\bright-/);
  });
});
```

- [ ] **Step 2: 테스트 실행 → RED**

Run: `yarn vitest run src/widgets-mobile/partyroom-display-board/ui/parts/expand-toggle.component.test.tsx 2>&1 | tail -20`
Expected: 5 fail — module not found.

- [ ] **Step 3: 컴포넌트 구현**

```tsx
// src/widgets-mobile/partyroom-display-board/ui/parts/expand-toggle.component.tsx
import { FC } from 'react';

interface Props {
  expanded: boolean;
  onToggle: () => void;
}

/**
 * ▾/◂ 토글. controlled (state owner = MobilePartyroomDisplayBoard, spec §4.4).
 *
 * a11y (spec §6.2):
 * - aria-label: expanded → '영상 가리기', collapsed → '영상 펼치기' (inline 한국어, §3 row 11)
 * - aria-pressed: !expanded (collapsed 가 pressed state)
 * - min-h/w 44px (iOS HIG hit-area)
 *
 * **positioning 책임은 parent (Chunk 3 VideoFrame).** 본문에 `absolute`/`top-*`/`right-*`
 * 등을 두면 leaf 가 부모 layout 에 coupling 됨. 시각 styling 도 최소 (overlay 가 영상
 * 위에 얹히는 상황은 parent 의 wrapper context — `bg-black/40` 등은 Chunk 3 에서 wrapping div 가 책임).
 */
const ExpandToggle: FC<Props> = ({ expanded, onToggle }) => {
  return (
    <button
      type='button'
      aria-label={expanded ? '영상 가리기' : '영상 펼치기'}
      aria-pressed={!expanded}
      onClick={onToggle}
      className='min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-200'
    >
      {expanded ? '▾' : '◂'}
    </button>
  );
};

export default ExpandToggle;
```

- [ ] **Step 4: 테스트 GREEN 확인**

Run: `yarn vitest run src/widgets-mobile/partyroom-display-board/ui/parts/expand-toggle.component.test.tsx 2>&1 | tail -20`
Expected: 5 tests passed.

- [ ] **Step 5: Commit**

```bash
git add src/widgets-mobile/partyroom-display-board/ui/parts/expand-toggle.component.tsx \
        src/widgets-mobile/partyroom-display-board/ui/parts/expand-toggle.component.test.tsx
git commit -m "feat(widgets-mobile/partyroom-display-board): ExpandToggle — ▾/◂ 토글 버튼 (controlled, 44×44 hit-area, spec §6.2)"
```

### Task 2.3: NowPlayingMeta (트랙메타 column/row)

**Files:**

- Create: `src/widgets-mobile/partyroom-display-board/ui/parts/now-playing-meta.component.tsx`
- Create: `src/widgets-mobile/partyroom-display-board/ui/parts/now-playing-meta.component.test.tsx`

- [ ] **Step 1: 테스트 작성 (RED 5 케이스)**

```tsx
// src/widgets-mobile/partyroom-display-board/ui/parts/now-playing-meta.component.test.tsx
/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import NowPlayingMeta from './now-playing-meta.component';

describe('NowPlayingMeta', () => {
  test('layout="column": 트랙명·DJ·duration 3 라인 렌더 (Mode A 사용)', () => {
    render(
      <NowPlayingMeta
        layout='column'
        trackName='Test Track'
        djNickname='DJ Alpha'
        duration='3:45'
      />
    );
    expect(screen.getByText('Test Track')).toBeTruthy();
    expect(screen.getByText(/DJ Alpha/)).toBeTruthy();
    expect(screen.getByText('3:45')).toBeTruthy();
  });

  test('layout="row": 트랙명·DJ·duration 모두 렌더 (Mode B 사용, 한 row)', () => {
    render(
      <NowPlayingMeta layout='row' trackName='Test Track' djNickname='DJ Beta' duration='2:10' />
    );
    expect(screen.getByText('Test Track')).toBeTruthy();
    expect(screen.getByText(/DJ Beta/)).toBeTruthy();
    expect(screen.getByText('2:10')).toBeTruthy();
  });

  test('djNickname=null 시 DJ 라인 미렌더 (트랙명·duration 만)', () => {
    render(
      <NowPlayingMeta layout='column' trackName='Solo Track' djNickname={null} duration='1:00' />
    );
    expect(screen.getByText('Solo Track')).toBeTruthy();
    expect(screen.queryByText(/🎧/)).toBeNull();
    expect(screen.getByText('1:00')).toBeTruthy();
  });

  test('layout 분기 root class — column 은 flex-col, row 는 flex-row', () => {
    const { container, rerender } = render(
      <NowPlayingMeta layout='column' trackName='T' djNickname={null} duration='0:00' />
    );
    const rootColumn = container.firstElementChild as HTMLElement;
    expect(rootColumn.className).toMatch(/\bflex-col\b/);

    rerender(<NowPlayingMeta layout='row' trackName='T' djNickname={null} duration='0:00' />);
    const rootRow = container.firstElementChild as HTMLElement;
    expect(rootRow.className).toMatch(/\bflex-row\b/);
  });

  test('row variant 도 parent flex 토큰 (flex-1 / min-w-0 등) 보유 X — 책임은 parent NowPlayingRow', () => {
    const { container } = render(
      <NowPlayingMeta layout='row' trackName='T' djNickname='D' duration='0:00' />
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).not.toMatch(/\bflex-1\b/);
    expect(root.className).not.toMatch(/\bmin-w-0\b/);
  });
});
```

- [ ] **Step 2: 테스트 실행 → RED**

Run: `yarn vitest run src/widgets-mobile/partyroom-display-board/ui/parts/now-playing-meta.component.test.tsx 2>&1 | tail -20`
Expected: 5 fail — module not found.

- [ ] **Step 3: 컴포넌트 구현**

```tsx
// src/widgets-mobile/partyroom-display-board/ui/parts/now-playing-meta.component.tsx
import { FC } from 'react';
import { cn } from '@/shared/lib/functions/cn';

interface Props {
  layout: 'column' | 'row';
  trackName: string;
  djNickname: string | null;
  /** `M:SS` 또는 `MM:SS` 사전 포맷 문자열. parent 가 책임. */
  duration: string;
}

/**
 * 트랙메타 (트랙명·DJ·duration) — Mode A = column, Mode B = row (spec §4.4 / §6.4 prop 정의).
 *
 * **`layout` prop 의미**: 본 컴포넌트 *내부* 의 배치만 결정.
 * - column = 트랙명 / DJ / duration 세 줄 vertical stack (Mode A 시 16:9 박스 *아래*).
 * - row    = 트랙명 · DJ · duration 한 줄 horizontal inline (Mode B 시 NowPlayingRow 안에서 TapToPlayButton 과 sibling).
 *
 * **외부 배치는 NowPlayingRow (Chunk 4 의 root MobilePartyroomDisplayBoard) 책임**.
 * `flex-1` / `min-w-0` 등 부모-context-의존 토큰은 본문에 두지 않음 (책임 분리, Chunk 2 잠금).
 *
 * inline 한국어 (DJ 아이콘 = emoji, 본문 i18n 의존 0, §3 row 11).
 */
const NowPlayingMeta: FC<Props> = ({ layout, trackName, djNickname, duration }) => {
  return (
    <div
      className={cn(
        'flex',
        layout === 'column' ? 'flex-col space-y-1' : 'flex-row items-center gap-2'
      )}
    >
      <p className='text-base font-semibold text-white truncate'>{trackName}</p>
      {djNickname && <p className='text-xs text-gray-500 truncate'>🎧 {djNickname}</p>}
      <p className='text-xs text-gray-600 shrink-0'>{duration}</p>
    </div>
  );
};

export default NowPlayingMeta;
```

- [ ] **Step 4: 테스트 GREEN 확인**

Run: `yarn vitest run src/widgets-mobile/partyroom-display-board/ui/parts/now-playing-meta.component.test.tsx 2>&1 | tail -20`
Expected: 5 tests passed.

- [ ] **Step 5: Commit**

```bash
git add src/widgets-mobile/partyroom-display-board/ui/parts/now-playing-meta.component.tsx \
        src/widgets-mobile/partyroom-display-board/ui/parts/now-playing-meta.component.test.tsx
git commit -m "feat(widgets-mobile/partyroom-display-board): NowPlayingMeta — column/row 양 layout (spec §6.4)"
```

### Task 2.4: TapToPlayButton (Mode B release ▶)

**Files:**

- Create: `src/widgets-mobile/partyroom-display-board/ui/parts/tap-to-play-button.component.tsx`
- Create: `src/widgets-mobile/partyroom-display-board/ui/parts/tap-to-play-button.component.test.tsx`

- [ ] **Step 1: 테스트 작성 (RED 4 케이스)**

```tsx
// src/widgets-mobile/partyroom-display-board/ui/parts/tap-to-play-button.component.test.tsx
/**
 * @vitest-environment jsdom
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import TapToPlayButton from './tap-to-play-button.component';

describe('TapToPlayButton', () => {
  test('autoplayBlocked=true 시 visible (▶ 아이콘 + aria-label="재생", spec §6.5.2)', () => {
    render(<TapToPlayButton autoplayBlocked={true} onTap={() => {}} />);
    const btn = screen.getByRole('button', { name: '재생' });
    expect(btn).toBeTruthy();
  });

  test('autoplayBlocked=false 시 미렌더 (release 후 hide)', () => {
    const { container } = render(<TapToPlayButton autoplayBlocked={false} onTap={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  test('클릭 시 onTap 콜백 1회 호출', () => {
    const onTap = vi.fn();
    render(<TapToPlayButton autoplayBlocked={true} onTap={onTap} />);
    fireEvent.click(screen.getByRole('button', { name: '재생' }));
    expect(onTap).toHaveBeenCalledTimes(1);
  });

  test('44×44 hit-area class (iOS HIG, spec §6.5.2)', () => {
    render(<TapToPlayButton autoplayBlocked={true} onTap={() => {}} />);
    const btn = screen.getByRole('button', { name: '재생' });
    expect(btn.className).toMatch(/\bmin-h-\[44px\]/);
    expect(btn.className).toMatch(/\bmin-w-\[44px\]/);
  });
});
```

- [ ] **Step 2: 테스트 실행 → RED**

Run: `yarn vitest run src/widgets-mobile/partyroom-display-board/ui/parts/tap-to-play-button.component.test.tsx 2>&1 | tail -20`
Expected: 4 fail — module not found.

- [ ] **Step 3: 컴포넌트 구현**

```tsx
// src/widgets-mobile/partyroom-display-board/ui/parts/tap-to-play-button.component.tsx
import { FC } from 'react';

interface Props {
  /**
   * **합성 (pre-computed) prop**: root 에서 `gate.autoplayBlocked && !gate.played`
   * 를 미리 계산해 내려주는 합성 boolean. 본 컴포넌트는 raw `gate.autoplayBlocked`
   * 를 받지 않으며 `played` 도 받지 않는다 (spec §6.5.2 single source of truth).
   */
  autoplayBlocked: boolean;
  onTap: () => void;
}

/**
 * Mode B 의 release 경로 — autoplay 차단 시 NowPlayingMeta row 옆 sibling 으로
 * 렌더. Mode A 는 AutoplayGestureGate (full overlay) 사용 — Mode B 는 80×45
 * 영상 위 overlay 가 가독성·접근성 미흡이라 row sibling 으로 분리 (spec §6.5).
 *
 * **State 공유 보장 (spec §6.5.2)**:
 * - `autoplayBlocked` prop = root 의 `gate.autoplayBlocked && !gate.played` 합성값.
 * - `onTap` prop = root 의 `gate.handleGesturePlay` (AutoplayGestureGate 와 동일 함수).
 * - 두 control 모두 동일 hook state 로 구동 → tap → handleGesturePlay → setAutoplayBlocked(false) → 두 control 동시 hide.
 *
 * **positioning 책임은 parent (NowPlayingRow)**. 본문에 `absolute`/`top-*` 등 두지 않음.
 */
const TapToPlayButton: FC<Props> = ({ autoplayBlocked, onTap }) => {
  if (!autoplayBlocked) return null;
  return (
    <button
      type='button'
      aria-label='재생'
      onClick={onTap}
      className='shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center rounded bg-white/90 text-black'
    >
      <svg width='20' height='20' viewBox='0 0 24 24' fill='currentColor' aria-hidden>
        <path d='M8 5v14l11-7z' />
      </svg>
    </button>
  );
};

export default TapToPlayButton;
```

- [ ] **Step 4: 테스트 GREEN 확인**

Run: `yarn vitest run src/widgets-mobile/partyroom-display-board/ui/parts/tap-to-play-button.component.test.tsx 2>&1 | tail -20`
Expected: 4 tests passed.

- [ ] **Step 5: Commit**

```bash
git add src/widgets-mobile/partyroom-display-board/ui/parts/tap-to-play-button.component.tsx \
        src/widgets-mobile/partyroom-display-board/ui/parts/tap-to-play-button.component.test.tsx
git commit -m "feat(widgets-mobile/partyroom-display-board): TapToPlayButton — Mode B autoplay release ▶ 버튼 (single source, spec §6.5.2)"
```

### Task 2.5: Chunk 2 회귀 + lint + tsc

- [ ] **Step 1: parts 디렉토리 전체 vitest**

Run: `yarn vitest run src/widgets-mobile/partyroom-display-board/ui/parts/ 2>&1 | tail -30`
Expected: 4 test files · 17 tests passed (BlankPlaceholder 3 + ExpandToggle 5 + NowPlayingMeta 5 + TapToPlayButton 4). 기존 `action-buttons.component.tsx` / `action-button.component.tsx` 는 테스트 미작성 — 본 chunk 스코프 외.

- [ ] **Step 2: lint**

Run: `yarn lint --fix src/widgets-mobile/partyroom-display-board/ui/parts/ 2>&1 | tail -20`
Expected: 0 errors.

- [ ] **Step 3: tsc**

Run: `yarn tsc --noEmit -p tsconfig.json 2>&1 | tail -10`
Expected: 0 errors.

- [ ] **Step 4: clean working tree 확인**

Run: `git status --short`
Expected: empty.

> **Chunk 2 완료.** Chunk 3 (VideoFrame orchestrator) 로 진행.

---

## Chunk 3: VideoFrame Orchestrator (3-mode + ToS 가드)

> VideoFrame 은 Chunk 1 의 hook gate state 와 Chunk 2 의 4 parts 를 props 로만 의존하는 **단일 mode orchestrator**. wrapper-based sizing (§4.5 wrapperClass) 로 YoutubePlayer 의 width/height='100%' 를 고정 → IFrame remount 위험 0. TapToPlayButton 은 본 Chunk 범위 외 (NowPlayingRow 소속, §6.5.3, Chunk 4).
>
> **본 chunk 의 핵심 회귀 가드**:
>
> - wrapperClass 가 정적 string 리터럴만 반환 (Tailwind JIT 정적 scan)
> - JS 상수 (COLLAPSED_VIDEO_WIDTH/HEIGHT) ↔ wrapperClass 의 정적 토큰 sync
> - Mode A↔B 전환 시 YoutubePlayer mock 호출 count 유지 (remount 없음 검증)
> - ToS 가드: `hidden`/`opacity-0`/`w-px`/`h-px`/`pointer-events-none` 모든 mode 부재
> - ToS 가드: `data-testid='video-wrapper'` 에 `aria-hidden='true'` 직접 부착 안 됨

### Task 3.1: VideoFrame stub + 인터페이스 잠금

**Files:**

- Create: `src/widgets-mobile/partyroom-display-board/ui/parts/video-frame.component.tsx`

- [ ] **Step 1: 인터페이스 + stub 본문 작성 (상수 export 포함)**

```tsx
// src/widgets-mobile/partyroom-display-board/ui/parts/video-frame.component.tsx
'use client';
import dynamic from 'next/dynamic';
import { FC, RefObject } from 'react';
import type TReactPlayer from 'react-player';
import { YouTubeConfig } from 'react-player/youtube';
import { useUserPreferenceStore } from '@/entities/preference';
import { cn } from '@/shared/lib/functions/cn';
import type { AutoplayGestureGate } from '../../lib/use-autoplay-gesture-gate.hook';
import BlankPlaceholder from './blank-placeholder.component';
import ExpandToggle from './expand-toggle.component';

// 데스크탑과 동일하게 SSR off 동적 import. C3 격리 — 데스크탑 사본 import 안 함.
const YoutubePlayer = dynamic(() => import('react-player/youtube'), { ssr: false });

/**
 * Mode B 의 collapsed video 박스 픽셀. **JS 상수는 Playwright headed assertion 용 documentary 값**.
 * wrapperClass('B') 의 정적 Tailwind 토큰 (`w-[80px] h-[45px]`) 과 sync 가 유지되어야 함.
 * 단위 테스트가 두 값 일치를 가드 (spec §4.5).
 */
export const COLLAPSED_VIDEO_WIDTH = 80;
export const COLLAPSED_VIDEO_HEIGHT = 45;

/**
 * wrapper Tailwind class — **정적 string 리터럴만 반환**. `w-[${var}px]` 같은 runtime
 * template 은 JIT 가 정적 scan 으로만 생성하므로 absent → wrapper 0×0 → ToS 위반 재발.
 */
export function wrapperClass(mode: 'A' | 'B' | 'C'): string {
  switch (mode) {
    case 'A':
      return 'aspect-video w-full bg-black rounded';
    case 'B':
      return 'w-[80px] h-[45px] shrink-0 bg-black rounded';
    case 'C':
      return 'aspect-video w-full bg-black rounded';
  }
}

interface Props {
  videoId: string | null;
  expanded: boolean;
  onToggleExpand: () => void;
  playerRef: RefObject<TReactPlayer | null>;
  gate: AutoplayGestureGate;
}

/**
 * 3-mode 단일 orchestrator (spec §4.5, §6.1).
 *
 * - mode 'A' (재생 + expanded): 16:9 풀폭 IFrame + ExpandToggle ▾
 * - mode 'B' (재생 + collapsed): 80×45 IFrame + ExpandToggle ◂
 * - mode 'C' (videoId === null): BlankPlaceholder + 토글 미렌더
 *
 * YoutubePlayer width/height 는 **'100%' 고정** — 부모 wrapper class 만 교체 → IFrame
 * remount 차단 (§4.5 핵심 보장).
 */
const VideoFrame: FC<Props> = (_props) => {
  throw new Error('not implemented');
};

export default VideoFrame;

/**
 * @see https://developers.google.com/youtube/player_parameters
 */
const config: YouTubeConfig = {
  playerVars: {
    controls: 0,
    autoplay: 1,
    modestbranding: 1,
    rel: 0,
    autohide: 1,
  },
};

// HACK: config 는 본문에서 곧 사용. 임시 미사용 lint 회피.
void config;
```

- [ ] **Step 2: TypeScript build sanity**

Run: `yarn tsc --noEmit -p tsconfig.json 2>&1 | tail -10`
Expected: 0 errors (stub 만 있어서 통과).

- [ ] **Step 3: Commit**

```bash
git add src/widgets-mobile/partyroom-display-board/ui/parts/video-frame.component.tsx
git commit -m "feat(widgets-mobile/partyroom-display-board): VideoFrame stub + wrapperClass + COLLAPSED_VIDEO_* 상수 (spec §4.5)"
```

### Task 3.2: 테스트 파일 scaffold + react-player mock

**Files:**

- Create: `src/widgets-mobile/partyroom-display-board/ui/parts/video-frame.component.test.tsx`

- [ ] **Step 1: 테스트 파일 scaffold — react-player/youtube mock + helper setupFrame()**

```tsx
// src/widgets-mobile/partyroom-display-board/ui/parts/video-frame.component.test.tsx
/**
 * @vitest-environment jsdom
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { useRef } from 'react';
import type TReactPlayer from 'react-player';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import type { AutoplayGestureGate } from '../../lib/use-autoplay-gesture-gate.hook';
import VideoFrame, {
  COLLAPSED_VIDEO_HEIGHT,
  COLLAPSED_VIDEO_WIDTH,
  wrapperClass,
} from './video-frame.component';

// react-player/youtube 동적 import 를 vitest 모듈 mock 으로 단순화.
// 호출 count 와 props 를 캡쳐해 remount / size prop 단언에 사용.
const youtubePlayerCalls: Array<Record<string, unknown>> = [];
vi.mock('react-player/youtube', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    youtubePlayerCalls.push(props);
    return <div data-testid='youtube-player-mock' data-url={String(props.url ?? '')} />;
  },
}));

// next/dynamic 의 SSR off 분기를 mock 으로 우회 — `react-player/youtube` mock 의
// default 를 그대로 통과시킨다. vi.mock 은 hoisted 라 mock 이 본 라인 시점에 이미
// 적용됨 — async importer 의 결과를 caching 만 하면 충분.
vi.mock('next/dynamic', async () => {
  const mod = await import('react-player/youtube');
  return { __esModule: true, default: () => mod.default };
});

// useUserPreferenceStore mock — volume / muted 기본값
vi.mock('@/entities/preference', () => ({
  useUserPreferenceStore: vi.fn((selector: (s: { volume: number; muted: boolean }) => unknown) =>
    selector({ volume: 1, muted: false })
  ),
}));

function makeGate(overrides: Partial<AutoplayGestureGate> = {}): AutoplayGestureGate {
  return {
    autoplayBlocked: false,
    played: false,
    playerReady: false,
    handleGesturePlay: vi.fn(),
    onReady: vi.fn(),
    onStart: vi.fn(),
    onPlay: vi.fn(),
    onPause: vi.fn(),
    ...overrides,
  };
}

function Harness({
  videoId,
  expanded,
  onToggleExpand,
  gate,
}: {
  videoId: string | null;
  expanded: boolean;
  onToggleExpand: () => void;
  gate: AutoplayGestureGate;
}) {
  const playerRef = useRef<TReactPlayer | null>(null);
  return (
    <VideoFrame
      videoId={videoId}
      expanded={expanded}
      onToggleExpand={onToggleExpand}
      playerRef={playerRef}
      gate={gate}
    />
  );
}

beforeEach(() => {
  youtubePlayerCalls.length = 0;
});
afterEach(() => {
  vi.clearAllMocks();
});
```

- [ ] **Step 2: 테스트 실행 → 빈 파일 → 0 tests (scaffolding 정상)**

Run: `yarn vitest run src/widgets-mobile/partyroom-display-board/ui/parts/video-frame.component.test.tsx 2>&1 | tail -20`
Expected: 0 tests / "no test suite" warning (또는 vitest 가 0 test 로 PASS — describe 가 아직 없음). 어느 형태든 실행 자체는 통과.

- [ ] **Step 3: Commit scaffold**

```bash
git add src/widgets-mobile/partyroom-display-board/ui/parts/video-frame.component.test.tsx
git commit -m "test(widgets-mobile/partyroom-display-board): VideoFrame 테스트 scaffold + react-player/dynamic mock + Harness"
```

### Task 3.3: 상수 + wrapperClass 정적 리터럴 단언 (Cases 11, 12 → 첫 GREEN)

**Files:**

- Modify: `src/widgets-mobile/partyroom-display-board/ui/parts/video-frame.component.test.tsx`

- [ ] **Step 1: describe 블록 + 케이스 2개 (정적 리터럴 + 상수 sync)**

테스트 파일 맨 끝에 추가:

```tsx
describe('VideoFrame · wrapperClass (정적 리터럴 가드, spec §4.5)', () => {
  test('Mode A 리터럴: aspect-video w-full bg-black rounded', () => {
    expect(wrapperClass('A')).toBe('aspect-video w-full bg-black rounded');
  });

  test('Mode B 리터럴: w-[80px] h-[45px] shrink-0 bg-black rounded — Tailwind JIT 정적 scan 안전', () => {
    expect(wrapperClass('B')).toBe('w-[80px] h-[45px] shrink-0 bg-black rounded');
  });

  test('Mode C 리터럴: aspect-video w-full bg-black rounded', () => {
    expect(wrapperClass('C')).toBe('aspect-video w-full bg-black rounded');
  });

  test('JS 상수 ↔ wrapperClass(B) 정적 리터럴 sync — 상수만 바뀌면 fail', () => {
    expect(wrapperClass('B')).toContain(`w-[${COLLAPSED_VIDEO_WIDTH}px]`);
    expect(wrapperClass('B')).toContain(`h-[${COLLAPSED_VIDEO_HEIGHT}px]`);
  });
});
```

- [ ] **Step 2: 테스트 실행 → 즉시 GREEN (wrapperClass 는 stub 단계에서 이미 구현됨)**

Run: `yarn vitest run src/widgets-mobile/partyroom-display-board/ui/parts/video-frame.component.test.tsx 2>&1 | tail -20`
Expected: 4 tests passed.

- [ ] **Step 3: Commit**

```bash
git add src/widgets-mobile/partyroom-display-board/ui/parts/video-frame.component.test.tsx
git commit -m "test(widgets-mobile/partyroom-display-board): wrapperClass 정적 리터럴 + JS 상수 sync 가드 (spec §7.1 #11, #12)"
```

### Task 3.4: Mode A 렌더 — YoutubePlayer 100% / wrapper class / ExpandToggle (Cases 1, 8) — RED → GREEN

**Files:**

- Modify: `src/widgets-mobile/partyroom-display-board/ui/parts/video-frame.component.tsx`
- Modify: `src/widgets-mobile/partyroom-display-board/ui/parts/video-frame.component.test.tsx`

- [ ] **Step 1: 테스트 추가 (RED 3 케이스)**

테스트 파일에 새 describe 추가:

```tsx
describe('VideoFrame · Mode A (재생 + expanded)', () => {
  test('YoutubePlayer mount + width=100% / height=100% / url 정상', () => {
    render(<Harness videoId='abc' expanded={true} onToggleExpand={() => {}} gate={makeGate()} />);
    expect(youtubePlayerCalls).toHaveLength(1);
    const props = youtubePlayerCalls[0];
    expect(props.width).toBe('100%');
    expect(props.height).toBe('100%');
    expect(props.url).toBe('https://www.youtube.com/watch?v=abc');
    expect(screen.getByTestId('youtube-player-mock')).toBeTruthy();
  });

  test('wrapper 가 wrapperClass("A") 정적 토큰 보유 + ExpandToggle ▾ (expanded=true)', () => {
    render(<Harness videoId='abc' expanded={true} onToggleExpand={() => {}} gate={makeGate()} />);
    const wrapper = screen.getByTestId('video-wrapper');
    expect(wrapper.className).toContain('aspect-video');
    expect(wrapper.className).toContain('w-full');
    expect(wrapper.className).toContain('bg-black');
    expect(wrapper.className).toContain('rounded');
    expect(screen.getByRole('button', { name: '영상 가리기' })).toBeTruthy();
    expect(screen.queryByTestId('blank-placeholder')).toBeNull();
  });

  test('autoplayBlocked && !played 시 AutoplayGestureGate overlay 렌더 + 클릭 시 handleGesturePlay 호출', () => {
    const handleGesturePlay = vi.fn();
    const gate = makeGate({ autoplayBlocked: true, played: false, handleGesturePlay });
    render(<Harness videoId='abc' expanded={true} onToggleExpand={() => {}} gate={gate} />);
    const overlay = screen.getByTestId('autoplay-gesture-gate');
    fireEvent.click(overlay);
    expect(handleGesturePlay).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: 테스트 실행 → RED (VideoFrame 본문 throw)**

Run: `yarn vitest run src/widgets-mobile/partyroom-display-board/ui/parts/video-frame.component.test.tsx 2>&1 | tail -20`
Expected: 3 fail (Mode A 케이스 3개) — `not implemented` throw.

- [ ] **Step 3: VideoFrame 본문 구현 — Mode A · Mode B · Mode C 모두 한 번에 (mode derive + wrapper + YoutubePlayer + BlankPlaceholder + AutoplayGestureGate overlay + ExpandToggle wrapping)**

`video-frame.component.tsx` 의 `const VideoFrame: FC<Props> = (_props) => { throw new Error('not implemented'); };` 와 그 위 `import` 블록을 다음으로 교체:

```tsx
'use client';
import dynamic from 'next/dynamic';
import { FC, RefObject } from 'react';
import type TReactPlayer from 'react-player';
import { YouTubeConfig } from 'react-player/youtube';
import { useUserPreferenceStore } from '@/entities/preference';
import { cn } from '@/shared/lib/functions/cn';
import type { AutoplayGestureGate } from '../../lib/use-autoplay-gesture-gate.hook';
import BlankPlaceholder from './blank-placeholder.component';
import ExpandToggle from './expand-toggle.component';

const YoutubePlayer = dynamic(() => import('react-player/youtube'), { ssr: false });
```

그리고 stub 본문을 다음으로 교체:

```tsx
const VideoFrame: FC<Props> = ({ videoId, expanded, onToggleExpand, playerRef, gate }) => {
  const mode: 'A' | 'B' | 'C' = videoId === null ? 'C' : expanded ? 'A' : 'B';
  const volume = useUserPreferenceStore((s) => s.volume);
  const muted = useUserPreferenceStore((s) => s.muted);

  const showOverlayGate = mode === 'A' && gate.autoplayBlocked && !gate.played;
  const showToggle = mode === 'A' || mode === 'B';

  return (
    <div className='relative'>
      <div data-testid='video-wrapper' className={cn('relative', wrapperClass(mode))}>
        {mode === 'C' ? (
          <BlankPlaceholder />
        ) : (
          <YoutubePlayer
            key={`video-${gate.playerReady}-${gate.played}`}
            url={`https://www.youtube.com/watch?v=${videoId}`}
            playing={gate.playerReady}
            volume={muted ? 0 : volume}
            muted={muted}
            width='100%'
            height='100%'
            className='bg-black rounded'
            onReady={(player: TReactPlayer) => {
              playerRef.current = player;
              gate.onReady(player);
            }}
            onStart={gate.onStart}
            onPlay={gate.onPlay}
            onPause={gate.onPause}
            config={config}
          />
        )}
        {showOverlayGate && (
          // z-20: autoplay 차단 시 overlay 가 ExpandToggle 을 의도적으로 가린다.
          // 사용자가 토글 접근 전에 먼저 gesture release 를 해야 함 (UX 잠금).
          <button
            type='button'
            data-testid='autoplay-gesture-gate'
            aria-label='클릭하여 재생'
            onClick={gate.handleGesturePlay}
            className='absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-black/70 cursor-pointer'
          >
            <span className='flex items-center justify-center w-16 h-16 rounded-full bg-white/90'>
              <svg width='28' height='28' viewBox='0 0 24 24' fill='black' aria-hidden>
                <path d='M8 5v14l11-7z' />
              </svg>
            </span>
            <span className='text-sm text-gray-100'>클릭하여 재생</span>
          </button>
        )}
        {showToggle && (
          <div className='absolute top-1 right-1 bg-black/40 rounded-full p-1'>
            <ExpandToggle expanded={expanded} onToggle={onToggleExpand} />
          </div>
        )}
      </div>
    </div>
  );
};
```

마지막 `void config;` 라인 제거 (이제 본문에서 실 사용).

- [ ] **Step 4: 테스트 실행 → Mode A GREEN + 상수 케이스 유지**

Run: `yarn vitest run src/widgets-mobile/partyroom-display-board/ui/parts/video-frame.component.test.tsx 2>&1 | tail -30`
Expected: 7 tests passed (4 wrapperClass + 3 Mode A).

- [ ] **Step 5: Commit**

```bash
git add src/widgets-mobile/partyroom-display-board/ui/parts/video-frame.component.tsx \
        src/widgets-mobile/partyroom-display-board/ui/parts/video-frame.component.test.tsx
git commit -m "test(widgets-mobile/partyroom-display-board): VideoFrame Mode A — YoutubePlayer 100%/url + wrapper + ExpandToggle ▾ + AutoplayGestureGate overlay

feat: 3-mode orchestrator 본문 — wrapper-based sizing (width=100%/height=100% 고정), wrapperClass(mode) 정적 토큰, ExpandToggle positioning (bg-black/40 rounded) 책임은 VideoFrame 의 wrapping div (Chunk 2 책임 분리 잠금 적용)"
```

### Task 3.5: Mode B 렌더 (Case 2) + Mode B 에서 AutoplayGestureGate 미렌더 (Case 8 partial)

**Files:**

- Modify: `src/widgets-mobile/partyroom-display-board/ui/parts/video-frame.component.test.tsx`

- [ ] **Step 1: 테스트 추가**

```tsx
describe('VideoFrame · Mode B (재생 + collapsed)', () => {
  test('wrapper 가 wrapperClass("B") 정적 토큰 (80×45) + ExpandToggle ◂ (expanded=false)', () => {
    render(<Harness videoId='abc' expanded={false} onToggleExpand={() => {}} gate={makeGate()} />);
    const wrapper = screen.getByTestId('video-wrapper');
    expect(wrapper.className).toContain('w-[80px]');
    expect(wrapper.className).toContain('h-[45px]');
    expect(wrapper.className).toContain('shrink-0');
    expect(wrapper.className).toContain('bg-black');
    expect(screen.getByRole('button', { name: '영상 펼치기' })).toBeTruthy();
  });

  test('YoutubePlayer width=100%/height=100% 그대로 (wrapper 만 80×45) — IFrame remount 회피', () => {
    render(<Harness videoId='abc' expanded={false} onToggleExpand={() => {}} gate={makeGate()} />);
    expect(youtubePlayerCalls).toHaveLength(1);
    expect(youtubePlayerCalls[0].width).toBe('100%');
    expect(youtubePlayerCalls[0].height).toBe('100%');
  });

  test('Mode B 에서는 autoplayBlocked 라도 AutoplayGestureGate overlay 미렌더 (Mode A only)', () => {
    const gate = makeGate({ autoplayBlocked: true, played: false });
    render(<Harness videoId='abc' expanded={false} onToggleExpand={() => {}} gate={gate} />);
    expect(screen.queryByTestId('autoplay-gesture-gate')).toBeNull();
  });
});
```

- [ ] **Step 2: 테스트 실행 → GREEN (이미 Mode B 본문 동작)**

Run: `yarn vitest run src/widgets-mobile/partyroom-display-board/ui/parts/video-frame.component.test.tsx 2>&1 | tail -20`
Expected: 10 tests passed.

- [ ] **Step 3: Commit**

```bash
git add src/widgets-mobile/partyroom-display-board/ui/parts/video-frame.component.test.tsx
git commit -m "test(widgets-mobile/partyroom-display-board): VideoFrame Mode B — 80×45 wrapper + width/height=100% + AutoplayGestureGate Mode A only (spec §6.5.1)"
```

### Task 3.6: Mode C 렌더 (Case 3) + Props 안전 videoId=null 강제 (Case 15)

**Files:**

- Modify: `src/widgets-mobile/partyroom-display-board/ui/parts/video-frame.component.test.tsx`

- [ ] **Step 1: 테스트 추가**

```tsx
describe('VideoFrame · Mode C (비재생, videoId=null)', () => {
  test('BlankPlaceholder visible + YoutubePlayer 미렌더 + Toggle 미렌더', () => {
    render(<Harness videoId={null} expanded={true} onToggleExpand={() => {}} gate={makeGate()} />);
    expect(screen.getByTestId('blank-placeholder')).toBeTruthy();
    expect(youtubePlayerCalls).toHaveLength(0);
    expect(screen.queryByRole('button', { name: /영상/ })).toBeNull();
  });

  test('Props 안전: videoId=null 이면 expanded=true 라도 Mode C 강제 (Mode A 진입 안 됨)', () => {
    render(<Harness videoId={null} expanded={true} onToggleExpand={() => {}} gate={makeGate()} />);
    const wrapper = screen.getByTestId('video-wrapper');
    expect(wrapper.className).toContain('aspect-video');
    expect(wrapper.className).not.toContain('w-[80px]');
    expect(screen.queryByTestId('youtube-player-mock')).toBeNull();
  });

  test('Props 안전: videoId=null + expanded=false 도 Mode C 강제 (Mode B 진입 안 됨)', () => {
    render(<Harness videoId={null} expanded={false} onToggleExpand={() => {}} gate={makeGate()} />);
    expect(screen.getByTestId('blank-placeholder')).toBeTruthy();
    expect(youtubePlayerCalls).toHaveLength(0);
  });
});
```

- [ ] **Step 2: 테스트 실행 → GREEN**

Run: `yarn vitest run src/widgets-mobile/partyroom-display-board/ui/parts/video-frame.component.test.tsx 2>&1 | tail -20`
Expected: 13 tests passed.

- [ ] **Step 3: Commit**

```bash
git add src/widgets-mobile/partyroom-display-board/ui/parts/video-frame.component.test.tsx
git commit -m "test(widgets-mobile/partyroom-display-board): VideoFrame Mode C — BlankPlaceholder + YoutubePlayer 미렌더 + videoId=null Props 안전 (spec §7.1 #15)"
```

### Task 3.7: Mode 전환 — A↔B remount 없음, B↔C / C↔A / A↔C mount/unmount (Cases 4, 5, 6, 7)

**Files:**

- Modify: `src/widgets-mobile/partyroom-display-board/ui/parts/video-frame.component.test.tsx`

- [ ] **Step 1: 테스트 추가 (4 케이스)**

```tsx
describe('VideoFrame · Mode 전환', () => {
  test('Mode A → B 전환: wrapper DOM element identity 보존 (remount 없음) + class 만 교체', () => {
    const { rerender } = render(
      <Harness videoId='abc' expanded={true} onToggleExpand={() => {}} gate={makeGate()} />
    );
    const wrapperBefore = screen.getByTestId('video-wrapper');
    const ytBefore = screen.getByTestId('youtube-player-mock');
    expect(wrapperBefore.className).toContain('aspect-video');

    rerender(
      <Harness videoId='abc' expanded={false} onToggleExpand={() => {}} gate={makeGate()} />
    );

    // 동일 컴포넌트 + 동일 key → React 가 동일 DOM element 보존 (referential equality).
    // 이 reference 동등성이 IFrame remount 없음의 강한 증거 (selector 안정성보다 강함).
    const wrapperAfter = screen.getByTestId('video-wrapper');
    const ytAfter = screen.getByTestId('youtube-player-mock');
    expect(wrapperAfter).toBe(wrapperBefore);
    expect(ytAfter).toBe(ytBefore);
    expect(wrapperAfter.className).toContain('w-[80px]');
    expect(wrapperAfter.className).toContain('h-[45px]');
    expect(wrapperAfter.className).not.toContain('aspect-video');
  });

  test('Mode B → C 전환: YoutubePlayer mock 호출 0회 (unmount, mode 시점 BlankPlaceholder)', () => {
    const { rerender } = render(
      <Harness videoId='abc' expanded={false} onToggleExpand={() => {}} gate={makeGate()} />
    );
    expect(screen.getByTestId('youtube-player-mock')).toBeTruthy();
    const callsBefore = youtubePlayerCalls.length;

    rerender(
      <Harness videoId={null} expanded={false} onToggleExpand={() => {}} gate={makeGate()} />
    );

    expect(screen.queryByTestId('youtube-player-mock')).toBeNull();
    expect(screen.getByTestId('blank-placeholder')).toBeTruthy();
    // unmount 후에는 추가 mock 호출 없음
    expect(youtubePlayerCalls.length).toBe(callsBefore);
  });

  test('Mode C → A 전환: BlankPlaceholder 사라지고 YoutubePlayer 신규 mount', () => {
    const { rerender } = render(
      <Harness videoId={null} expanded={true} onToggleExpand={() => {}} gate={makeGate()} />
    );
    expect(screen.getByTestId('blank-placeholder')).toBeTruthy();
    expect(youtubePlayerCalls).toHaveLength(0);

    rerender(<Harness videoId='abc' expanded={true} onToggleExpand={() => {}} gate={makeGate()} />);

    expect(screen.queryByTestId('blank-placeholder')).toBeNull();
    expect(screen.getByTestId('youtube-player-mock')).toBeTruthy();
    expect(youtubePlayerCalls.length).toBeGreaterThanOrEqual(1);
  });

  test('Mode A → C 전환: YoutubePlayer unmount + BlankPlaceholder mount (B→C 대칭 가드, spec §7.1 #12)', () => {
    const { rerender } = render(
      <Harness videoId='abc' expanded={true} onToggleExpand={() => {}} gate={makeGate()} />
    );
    expect(screen.getByTestId('youtube-player-mock')).toBeTruthy();

    rerender(
      <Harness videoId={null} expanded={true} onToggleExpand={() => {}} gate={makeGate()} />
    );

    expect(screen.queryByTestId('youtube-player-mock')).toBeNull();
    expect(screen.getByTestId('blank-placeholder')).toBeTruthy();
  });
});
```

- [ ] **Step 2: 테스트 실행 → GREEN**

Run: `yarn vitest run src/widgets-mobile/partyroom-display-board/ui/parts/video-frame.component.test.tsx 2>&1 | tail -20`
Expected: 17 tests passed.

- [ ] **Step 3: Commit**

```bash
git add src/widgets-mobile/partyroom-display-board/ui/parts/video-frame.component.test.tsx
git commit -m "test(widgets-mobile/partyroom-display-board): VideoFrame mode 전환 4건 — A↔B no-remount + B↔C / C↔A / A↔C mount/unmount (spec §7.1 #4~7, #12)"
```

### Task 3.8: ToS 가드 회귀 (Cases 13, 14)

**Files:**

- Modify: `src/widgets-mobile/partyroom-display-board/ui/parts/video-frame.component.test.tsx`

- [ ] **Step 1: 테스트 추가 (2 케이스)**

```tsx
describe('VideoFrame · ToS 가드 (회귀, spec §5)', () => {
  test.each(['A', 'B', 'C'] as const)(
    'Mode %s: wrapper className 에 hidden/opacity-0/w-px/h-px/pointer-events-none 토큰 부재',
    (mode) => {
      const videoId = mode === 'C' ? null : 'abc';
      const expanded = mode === 'A' || mode === 'C';
      render(
        <Harness
          videoId={videoId}
          expanded={expanded}
          onToggleExpand={() => {}}
          gate={makeGate()}
        />
      );
      const wrapper = screen.getByTestId('video-wrapper');
      expect(wrapper.className).not.toMatch(/\bhidden\b/);
      expect(wrapper.className).not.toMatch(/\bopacity-0\b/);
      expect(wrapper.className).not.toMatch(/\bw-px\b/);
      expect(wrapper.className).not.toMatch(/\bh-px\b/);
      expect(wrapper.className).not.toMatch(/\bpointer-events-none\b/);
    }
  );

  test('video-wrapper testid 에 aria-hidden="true" 직접 부착 안 됨', () => {
    render(<Harness videoId='abc' expanded={true} onToggleExpand={() => {}} gate={makeGate()} />);
    const wrapper = screen.getByTestId('video-wrapper');
    expect(wrapper.getAttribute('aria-hidden')).toBeNull();
  });
});
```

- [ ] **Step 2: 테스트 실행 → GREEN**

Run: `yarn vitest run src/widgets-mobile/partyroom-display-board/ui/parts/video-frame.component.test.tsx 2>&1 | tail -20`
Expected: 21 tests passed (test.each 3 mode × 1 = 3 추가 + aria 1 추가 = 17→21).

> Note: spec §7.1 의 "ToS 가드 회귀" 1 항목은 plan 에서 `test.each` 로 3-mode parametrize → 3 개 단언 (실 테스트 카운트 3). aria-hidden 단언 1 → 합계 4 추가. 본 chunk 의 video-frame.test.tsx 누적 케이스 21 — File Structure 의 "14" 카운트는 logical 카운트 (test.each 의 3-mode 를 1 case 로 묶음) 기준. 누적 21 / 14 logical 의 차이는 의도된 회귀 강화.

- [ ] **Step 3: Commit**

```bash
git add src/widgets-mobile/partyroom-display-board/ui/parts/video-frame.component.test.tsx
git commit -m "test(widgets-mobile/partyroom-display-board): ToS 가드 회귀 — hidden/opacity-0/w-px/h-px/pointer-events-none 모든 mode 부재 + video-wrapper aria-hidden 부재 (spec §5, §7.1 #13/#14)"
```

### Task 3.9: Chunk 3 회귀 + lint + tsc

- [ ] **Step 1: VideoFrame + parts 전체 vitest**

Run: `yarn vitest run src/widgets-mobile/partyroom-display-board/ 2>&1 | tail -30`
Expected: 6 test files (hook 1 + parts 4 + video-frame 1) · 46 tests passed (hook 8 + parts 17 + video-frame 21).

- [ ] **Step 2: lint**

Run: `yarn lint --fix src/widgets-mobile/partyroom-display-board/ 2>&1 | tail -20`
Expected: 0 errors.

- [ ] **Step 3: tsc**

Run: `yarn tsc --noEmit -p tsconfig.json 2>&1 | tail -10`
Expected: 0 errors.

- [ ] **Step 4: clean working tree 확인**

Run: `git status --short`
Expected: empty.

> **Chunk 3 완료.** Chunk 4 (root rewrite + integration tests) 로 진행.

---

## Chunk 4: Root Rewrite (MobilePartyroomDisplayBoard) + Integration Tests

> 본 chunk 는 chunk 2 의 1px IFrame 본문을 폐기하고 VideoFrame + NowPlayingRow (NowPlayingMeta + TapToPlayButton) 를 mount 한다. `useAutoplayGestureGate` 가 root 에서 1회 호출되어 VideoFrame 의 AutoplayGestureGate 와 NowPlayingRow 의 TapToPlayButton 양쪽에 동일 `gate` state 를 주입 (§4.4 / §6.5.2 single source of truth).
>
> **본 chunk 의 핵심 회귀 가드**:
>
> - expanded state 가 토글 클릭 1곳에서만 변경 (트랙 변경·Mode C 진입·remount 자동 변환 없음, §4.4 불변식).
> - Mode C → 재생 복귀 시 사용자 마지막 선택 (Mode A 또는 B) 으로 직접 진입.
> - NowPlayingRow 는 `min-h-[44px]` 보유 → TapToPlayButton 의 iOS HIG hit-area 확보 (§6.4 reviewer 3차 #2).
> - Cross-component single source: Mode B + autoplayBlocked → Mode A toggle 시 AutoplayGestureGate overlay 즉시 visible.

### Task 4.1: Root component 본문 재설계 (chunk 2 의 1px IFrame 폐기)

**Files:**

- Modify: `src/widgets-mobile/partyroom-display-board/partyroom-display-board.component.tsx`

- [ ] **Step 1: 기존 본문을 신규 구조로 전체 교체**

기존 `partyroom-display-board.component.tsx` 의 본문 (line 1~108) 을 다음으로 교체:

```tsx
'use client';

import { useRouter } from 'next/navigation';
import { FC, useRef, useState } from 'react';
import type TReactPlayer from 'react-player';
import { useFetchPartyroomDetailSummary } from '@/features/partyroom/get-summary';
import { cn } from '@/shared/lib/functions/cn';
import { useStores } from '@/shared/lib/store/stores.context';
import useAutoplayGestureGate from './lib/use-autoplay-gesture-gate.hook';
import ActionButtons from './ui/parts/action-buttons.component';
import NowPlayingMeta from './ui/parts/now-playing-meta.component';
import TapToPlayButton from './ui/parts/tap-to-play-button.component';
import VideoFrame from './ui/parts/video-frame.component';

interface Props {
  partyroomId: number;
}

/**
 * 모바일 전광판 — chunk 3.1 재설계 (spec §4.2 / §6.*).
 *
 * 본 컴포넌트 책임:
 * 1. expanded state owner (룸 mount 시 true, 토글 클릭만 변경, 다른 어떤 트리거도 자동 전환 X).
 * 2. useAutoplayGestureGate 호출 — VideoFrame 의 overlay 와 NowPlayingRow 의 TapToPlayButton
 *    양쪽에 동일 `gate` state 주입 (§4.4 / §6.5.2 single source of truth).
 * 3. NowPlayingRow (min-h-[44px]) 로 NowPlayingMeta + TapToPlayButton 를 같은 row 로 wrap
 *    → TapToPlayButton 의 iOS HIG 44×44 hit-area 확보 (§6.4 reviewer 3차 #2).
 *
 * 데스크탑 `widgets/partyroom-display-board/*` 는 0 수정 (§3 row 9).
 *
 * Header (뒤로·룸이름·⋮) 는 본 컴포넌트 직접 — page.tsx 는 모바일 룸에서 글로벌 `<Header />` 미렌더.
 */
const MobilePartyroomDisplayBoard: FC<Props> = ({ partyroomId }) => {
  const router = useRouter();
  const { useCurrentPartyroom } = useStores();
  const playbackActivated = useCurrentPartyroom((state) => state.playbackActivated);
  const playback = useCurrentPartyroom((state) => state.playback);
  const currentDj = useCurrentPartyroom((state) => state.currentDj);
  const crews = useCurrentPartyroom((state) => state.crews);
  // 두번째 arg = chunk 2 의 기존 시그니처 그대로 유지 (suspense/enabled flag, 데스크탑 룸과 동일 패턴).
  const { data: detailSummary } = useFetchPartyroomDetailSummary(partyroomId, true);
  const partyroomTitle = detailSummary?.title ?? '';

  const currentDjNickname = currentDj
    ? (crews.find((c) => c.crewId === currentDj.crewId)?.nickname ?? null)
    : null;

  const [expanded, setExpanded] = useState(true);
  const playerRef = useRef<TReactPlayer | null>(null);

  const videoId = playbackActivated ? (playback?.linkId ?? null) : null;
  const isPlaying = videoId !== null;
  const mode: 'A' | 'B' | 'C' = !isPlaying ? 'C' : expanded ? 'A' : 'B';

  const gate = useAutoplayGestureGate({ playerRef, playable: isPlaying, videoId });

  // TapToPlayButton 합성 prop: AutoplayGestureGate 의 visible 조건과 동일 (single source).
  const tapToPlayVisible = gate.autoplayBlocked && !gate.played;

  return (
    <div className={cn('sticky top-0 z-20 w-full bg-black border-b border-gray-800')}>
      {/* 헤더 row: 뒤로 · 룸 이름 · ⋮ */}
      <header className='flex items-center justify-between px-4 h-12'>
        <button
          aria-label='뒤로'
          className='w-11 h-11 flex items-center justify-center text-gray-300'
          onClick={() => router.push('/parties')}
        >
          ←
        </button>
        <h1 className='flex-1 text-center text-base font-semibold text-white truncate px-2'>
          {partyroomTitle}
        </h1>
        <button
          aria-label='메뉴'
          className='w-11 h-11 flex items-center justify-center text-gray-300'
        >
          ⋮
        </button>
      </header>

      {/* VideoFrame: 3-mode (A/B/C) — chunk 3 컴포넌트 */}
      <div className='px-4 pt-3'>
        <VideoFrame
          videoId={videoId}
          expanded={expanded}
          onToggleExpand={() => setExpanded((v) => !v)}
          playerRef={playerRef}
          gate={gate}
        />
      </div>

      {/* NowPlayingRow: 트랙메타 + TapToPlayButton (Mode B 만) — min-h 44 hit-area */}
      {mode !== 'C' && playback && (
        <div
          data-testid='now-playing-row'
          className='flex items-center min-h-[44px] px-4 pt-3 gap-3'
        >
          <div className={mode === 'A' ? 'w-full' : 'flex-1 min-w-0'}>
            <NowPlayingMeta
              layout={mode === 'A' ? 'column' : 'row'}
              trackName={playback.name}
              djNickname={currentDjNickname}
              duration={playback.duration}
            />
          </div>
          {mode === 'B' && (
            <TapToPlayButton autoplayBlocked={tapToPlayVisible} onTap={gate.handleGesturePlay} />
          )}
        </div>
      )}

      {/* 리액션 (chunk 2 그대로) */}
      <div className='flex gap-2 px-4 py-3'>
        <ActionButtons />
      </div>
    </div>
  );
};

export default MobilePartyroomDisplayBoard;
```

- [ ] **Step 2: TypeScript build sanity**

Run: `yarn tsc --noEmit -p tsconfig.json 2>&1 | tail -15`
Expected: 0 errors.

- [ ] **Step 3: lint 빠른 검증**

Run: `yarn lint --fix src/widgets-mobile/partyroom-display-board/partyroom-display-board.component.tsx 2>&1 | tail -15`
Expected: 0 errors.

- [ ] **Step 4: Commit (의도적으로 통합 테스트 RED 단계 — 본 task 만 push 하지 않음, 다음 task 와 함께)**

```bash
git add src/widgets-mobile/partyroom-display-board/partyroom-display-board.component.tsx
git commit -m "feat(widgets-mobile/partyroom-display-board): chunk 3.1 root rewrite — 1px IFrame 폐기 → VideoFrame + NowPlayingRow + useAutoplayGestureGate (spec §4.4)

BREAKING: chunk 2 의 \`1px×1px+opacity-0\` IFrame 본문 제거. YouTube IFrame Player API ToS 위반 fix (spec §2.2). 통합 테스트는 후속 task 에서 추가."
```

### Task 4.2: 통합 테스트 scaffold — mocks + Harness

**Files:**

- Create: `src/widgets-mobile/partyroom-display-board/partyroom-display-board.component.test.tsx`

- [ ] **Step 1: 테스트 파일 scaffold (mock 외부 의존성)**

```tsx
// src/widgets-mobile/partyroom-display-board/partyroom-display-board.component.test.tsx
/**
 * @vitest-environment jsdom
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

// react-player mock — VideoFrame test 와 동일 패턴
const youtubePlayerCalls: Array<Record<string, unknown>> = [];
vi.mock('react-player/youtube', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    youtubePlayerCalls.push(props);
    return <div data-testid='youtube-player-mock' data-url={String(props.url ?? '')} />;
  },
}));
vi.mock('next/dynamic', async () => {
  const mod = await import('react-player/youtube');
  return { __esModule: true, default: () => mod.default };
});

// next/navigation router mock
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

// useFetchPartyroomDetailSummary mock
vi.mock('@/features/partyroom/get-summary', () => ({
  useFetchPartyroomDetailSummary: () => ({
    data: { title: 'Test Room' },
  }),
}));

// userPreference mock — volume 1 / muted false
vi.mock('@/entities/preference', () => ({
  useUserPreferenceStore: vi.fn((selector: (s: { volume: number; muted: boolean }) => unknown) =>
    selector({ volume: 1, muted: false })
  ),
}));

// ActionButtons mock — 리액션 외부 의존성 격리
vi.mock('./ui/parts/action-buttons.component', () => ({
  __esModule: true,
  default: () => <div data-testid='action-buttons-mock' />,
}));

// useCurrentPartyroom mock — 테스트별 setMockStoreState 으로 갱신
type StoreState = {
  playbackActivated: boolean;
  playback: { name: string; duration: string; linkId: string } | null;
  currentDj: { crewId: number } | null;
  crews: Array<{ crewId: number; nickname: string }>;
};

let storeState: StoreState = {
  playbackActivated: true,
  playback: { name: 'Track 1', duration: '3:30', linkId: 'abc' },
  currentDj: { crewId: 1 },
  crews: [{ crewId: 1, nickname: 'DJ A' }],
};

vi.mock('@/shared/lib/store/stores.context', () => ({
  useStores: () => ({
    useCurrentPartyroom: (selector: (s: StoreState) => unknown) => selector(storeState),
  }),
}));

function setStoreState(patch: Partial<StoreState>) {
  storeState = { ...storeState, ...patch };
}

function resetStoreState() {
  storeState = {
    playbackActivated: true,
    playback: { name: 'Track 1', duration: '3:30', linkId: 'abc' },
    currentDj: { crewId: 1 },
    crews: [{ crewId: 1, nickname: 'DJ A' }],
  };
}

import MobilePartyroomDisplayBoard from './partyroom-display-board.component';

beforeEach(() => {
  vi.useFakeTimers();
  youtubePlayerCalls.length = 0;
  mockPush.mockClear();
  resetStoreState();
});
afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});
```

- [ ] **Step 2: scaffold sanity (vitest 가 모듈 로드 자체는 통과)**

Run: `yarn vitest run src/widgets-mobile/partyroom-display-board/partyroom-display-board.component.test.tsx 2>&1 | tail -20`
Expected: 0 tests (describe 없음) 또는 0 test PASS — 모듈 로딩 자체 실패 없어야.

- [ ] **Step 3: Commit scaffold**

```bash
git add src/widgets-mobile/partyroom-display-board/partyroom-display-board.component.test.tsx
git commit -m "test(widgets-mobile/partyroom-display-board): 통합 테스트 scaffold — store/router/dynamic/react-player mock"
```

### Task 4.3: 통합 #1~#3 — mount default + 토글 클릭 양방향 (Mode A↔B)

**Files:**

- Modify: `src/widgets-mobile/partyroom-display-board/partyroom-display-board.component.test.tsx`

- [ ] **Step 1: 첫 describe + 3 케이스 (mount, A→B, B→A)**

```tsx
describe('MobilePartyroomDisplayBoard · 토글 라이프사이클', () => {
  test('#1 룸 mount 시 expanded=true default → Mode A 진입 (16:9 wrapper + Toggle ▾)', () => {
    render(<MobilePartyroomDisplayBoard partyroomId={1} />);
    const wrapper = screen.getByTestId('video-wrapper');
    expect(wrapper.className).toContain('aspect-video');
    expect(wrapper.className).toContain('w-full');
    expect(screen.getByRole('button', { name: '영상 가리기' })).toBeTruthy();
  });

  test('#2 토글 클릭 → Mode B (80×45 wrapper + Toggle ◂)', () => {
    render(<MobilePartyroomDisplayBoard partyroomId={1} />);
    fireEvent.click(screen.getByRole('button', { name: '영상 가리기' }));
    const wrapper = screen.getByTestId('video-wrapper');
    expect(wrapper.className).toContain('w-[80px]');
    expect(wrapper.className).toContain('h-[45px]');
    expect(screen.getByRole('button', { name: '영상 펼치기' })).toBeTruthy();
  });

  test('#3 두 번째 토글 → Mode A 복귀', () => {
    render(<MobilePartyroomDisplayBoard partyroomId={1} />);
    fireEvent.click(screen.getByRole('button', { name: '영상 가리기' }));
    fireEvent.click(screen.getByRole('button', { name: '영상 펼치기' }));
    const wrapper = screen.getByTestId('video-wrapper');
    expect(wrapper.className).toContain('aspect-video');
    expect(wrapper.className).toContain('w-full');
    expect(screen.getByRole('button', { name: '영상 가리기' })).toBeTruthy();
  });
});
```

- [ ] **Step 2: 테스트 실행 → GREEN**

Run: `yarn vitest run src/widgets-mobile/partyroom-display-board/partyroom-display-board.component.test.tsx 2>&1 | tail -20`
Expected: 3 tests passed.

- [ ] **Step 3: Commit**

```bash
git add src/widgets-mobile/partyroom-display-board/partyroom-display-board.component.test.tsx
git commit -m "test(widgets-mobile/partyroom-display-board): integration #1~#3 — mount default Mode A + 토글 양방향 (spec §7.2 #1~#3)"
```

### Task 4.4: 통합 #4 — playback null → Mode C (토글 hide)

**Files:**

- Modify: `src/widgets-mobile/partyroom-display-board/partyroom-display-board.component.test.tsx`

- [ ] **Step 1: 케이스 추가**

```tsx
describe('MobilePartyroomDisplayBoard · Mode C 진입', () => {
  test('#4 playback null → Mode C: BlankPlaceholder + 토글 미렌더 + NowPlayingRow 미렌더', () => {
    setStoreState({ playbackActivated: false, playback: null });
    render(<MobilePartyroomDisplayBoard partyroomId={1} />);
    expect(screen.getByTestId('blank-placeholder')).toBeTruthy();
    expect(screen.queryByRole('button', { name: /영상/ })).toBeNull();
    expect(screen.queryByTestId('now-playing-row')).toBeNull();
    expect(screen.queryByTestId('youtube-player-mock')).toBeNull();
  });
});
```

- [ ] **Step 2: 테스트 실행 → GREEN**

Run: `yarn vitest run src/widgets-mobile/partyroom-display-board/partyroom-display-board.component.test.tsx 2>&1 | tail -20`
Expected: 4 tests passed.

- [ ] **Step 3: Commit**

```bash
git add src/widgets-mobile/partyroom-display-board/partyroom-display-board.component.test.tsx
git commit -m "test(widgets-mobile/partyroom-display-board): integration #4 — playback null → Mode C / Toggle hide / NowPlayingRow hide (spec §7.2 #4)"
```

### Task 4.5: 통합 #5~#7 — expanded 보존 invariants (트랙 변경 / Mode C 진입·복귀)

**Files:**

- Modify: `src/widgets-mobile/partyroom-display-board/partyroom-display-board.component.test.tsx`

- [ ] **Step 1: 케이스 추가 (3 케이스)**

```tsx
describe('MobilePartyroomDisplayBoard · expanded 보존 invariants', () => {
  test('#5 토글 B → playback 트랙 변경 → expanded=false 그대로 (자동 expand 없음)', () => {
    const { rerender } = render(<MobilePartyroomDisplayBoard partyroomId={1} />);
    fireEvent.click(screen.getByRole('button', { name: '영상 가리기' })); // Mode B
    expect(screen.getByTestId('video-wrapper').className).toContain('w-[80px]');

    // 새 트랙
    setStoreState({ playback: { name: 'Track 2', duration: '4:00', linkId: 'def' } });
    rerender(<MobilePartyroomDisplayBoard partyroomId={1} />);

    expect(screen.getByTestId('video-wrapper').className).toContain('w-[80px]');
    expect(screen.getByTestId('video-wrapper').className).toContain('h-[45px]');
    expect(screen.getByRole('button', { name: '영상 펼치기' })).toBeTruthy();
  });

  test('#6 Mode B → playback null (Mode C) → playback 재할당 → 여전히 Mode B (마지막 사용자 선택 보존)', () => {
    const { rerender } = render(<MobilePartyroomDisplayBoard partyroomId={1} />);
    fireEvent.click(screen.getByRole('button', { name: '영상 가리기' })); // Mode B

    setStoreState({ playbackActivated: false, playback: null });
    rerender(<MobilePartyroomDisplayBoard partyroomId={1} />);
    expect(screen.getByTestId('blank-placeholder')).toBeTruthy();

    setStoreState({
      playbackActivated: true,
      playback: { name: 'Track 3', duration: '2:00', linkId: 'ghi' },
    });
    rerender(<MobilePartyroomDisplayBoard partyroomId={1} />);
    expect(screen.getByTestId('video-wrapper').className).toContain('w-[80px]');
  });

  test('#7 Mode A → Mode C → 재할당 → Mode A 복귀 (역대칭 가드)', () => {
    const { rerender } = render(<MobilePartyroomDisplayBoard partyroomId={1} />);
    // Mode A 유지 (토글 안 누름)
    expect(screen.getByTestId('video-wrapper').className).toContain('aspect-video');

    setStoreState({ playbackActivated: false, playback: null });
    rerender(<MobilePartyroomDisplayBoard partyroomId={1} />);
    expect(screen.getByTestId('blank-placeholder')).toBeTruthy();

    setStoreState({
      playbackActivated: true,
      playback: { name: 'Track 4', duration: '1:30', linkId: 'jkl' },
    });
    rerender(<MobilePartyroomDisplayBoard partyroomId={1} />);
    expect(screen.getByTestId('video-wrapper').className).toContain('aspect-video');
    expect(screen.getByTestId('video-wrapper').className).toContain('w-full');
  });
});
```

- [ ] **Step 2: 테스트 실행 → GREEN**

Run: `yarn vitest run src/widgets-mobile/partyroom-display-board/partyroom-display-board.component.test.tsx 2>&1 | tail -20`
Expected: 7 tests passed.

- [ ] **Step 3: Commit**

```bash
git add src/widgets-mobile/partyroom-display-board/partyroom-display-board.component.test.tsx
git commit -m "test(widgets-mobile/partyroom-display-board): integration #5~#7 — expanded 보존 (트랙 변경 / Mode C 진입·복귀 사용자 선택 보존, spec §4.4 불변식)"
```

### Task 4.6: 통합 #8 — unmount/remount expanded reset

**Files:**

- Modify: `src/widgets-mobile/partyroom-display-board/partyroom-display-board.component.test.tsx`

- [ ] **Step 1: 케이스 추가**

```tsx
describe('MobilePartyroomDisplayBoard · component lifecycle', () => {
  test('#8 룸 unmount → 다시 mount → expanded=true 로 reset (component-local state)', () => {
    const { unmount } = render(<MobilePartyroomDisplayBoard partyroomId={1} />);
    fireEvent.click(screen.getByRole('button', { name: '영상 가리기' })); // Mode B
    expect(screen.getByTestId('video-wrapper').className).toContain('w-[80px]');

    unmount();

    render(<MobilePartyroomDisplayBoard partyroomId={1} />);
    // mount default = expanded=true → Mode A
    expect(screen.getByTestId('video-wrapper').className).toContain('aspect-video');
    expect(screen.getByRole('button', { name: '영상 가리기' })).toBeTruthy();
  });
});
```

- [ ] **Step 2: 테스트 실행 → GREEN**

Run: `yarn vitest run src/widgets-mobile/partyroom-display-board/partyroom-display-board.component.test.tsx 2>&1 | tail -20`
Expected: 8 tests passed.

- [ ] **Step 3: Commit**

```bash
git add src/widgets-mobile/partyroom-display-board/partyroom-display-board.component.test.tsx
git commit -m "test(widgets-mobile/partyroom-display-board): integration #8 — unmount/remount expanded reset (component-local state, spec §7.2 #8)"
```

### Task 4.7: 통합 #9~#10 — autoplay 차단 회귀 (트랙 변경 + Mode C → 재진입)

**Files:**

- Modify: `src/widgets-mobile/partyroom-display-board/partyroom-display-board.component.test.tsx`

- [ ] **Step 1: 케이스 추가 (2 케이스 — fake timer 가 hook timer 잡음)**

```tsx
describe('MobilePartyroomDisplayBoard · autoplay 차단 회귀', () => {
  test('#9 트랙 변경 시 autoplay 차단 재armed: 새 videoId + 1500ms 후 차단 → release control 렌더', () => {
    const { rerender } = render(<MobilePartyroomDisplayBoard partyroomId={1} />);

    // Mode A 초기 — IFrame mount 됐다고 가정. onReady → onPlay 로 played=true 유지.
    const firstYt = youtubePlayerCalls[0];
    (firstYt.onReady as (p: unknown) => void)({} as unknown);
    (firstYt.onPlay as () => void)();

    // 새 트랙으로 videoId 변경 — hook 의 videoId effect 가 played reset (autoplayBlocked 도 reset)
    // 단 playerReady 는 그대로 true 유지 (Chunk 1 Task 1.7 결정). timer effect 가 즉시 재armed.
    setStoreState({ playback: { name: 'Track 2', duration: '4:00', linkId: 'def' } });
    rerender(<MobilePartyroomDisplayBoard partyroomId={1} />);

    // 새 트랙의 YoutubePlayer 호출에 대한 onReady 도 호출 — 본문은 production mount 시퀀스의
    // 거울 (이미 playerReady=true 라 setPlayerReady(true) 는 no-op). 본 라인 제거 시 #9 PASS 여전.
    // production 행동을 정확히 mirror 하기 위해 남김 (timer arming 의 trigger 는 videoId effect 임).
    const newYt = youtubePlayerCalls[youtubePlayerCalls.length - 1];
    (newYt.onReady as (p: unknown) => void)({} as unknown);

    // 1500ms 경과 → autoplayBlocked=true → Mode A 에서 AutoplayGestureGate 렌더
    vi.advanceTimersByTime(1500);
    rerender(<MobilePartyroomDisplayBoard partyroomId={1} />);

    expect(screen.queryByTestId('autoplay-gesture-gate')).toBeTruthy();
  });

  test('#10 Mode C → 재할당 → onReady 후 1500ms 내 onPlay 없으면 차단 + release control 렌더 (cross-mode mount)', () => {
    setStoreState({ playbackActivated: false, playback: null });
    const { rerender } = render(<MobilePartyroomDisplayBoard partyroomId={1} />);
    expect(screen.getByTestId('blank-placeholder')).toBeTruthy();

    // 재할당
    setStoreState({
      playbackActivated: true,
      playback: { name: 'Track 5', duration: '3:00', linkId: 'mno' },
    });
    rerender(<MobilePartyroomDisplayBoard partyroomId={1} />);

    const yt = youtubePlayerCalls[youtubePlayerCalls.length - 1];
    (yt.onReady as (p: unknown) => void)({} as unknown);
    vi.advanceTimersByTime(1500);
    rerender(<MobilePartyroomDisplayBoard partyroomId={1} />);

    // expanded=true default 이므로 Mode A → AutoplayGestureGate overlay
    expect(screen.queryByTestId('autoplay-gesture-gate')).toBeTruthy();
  });
});
```

- [ ] **Step 2: 테스트 실행 → GREEN**

Run: `yarn vitest run src/widgets-mobile/partyroom-display-board/partyroom-display-board.component.test.tsx 2>&1 | tail -20`
Expected: 10 tests passed.

- [ ] **Step 3: Commit**

```bash
git add src/widgets-mobile/partyroom-display-board/partyroom-display-board.component.test.tsx
git commit -m "test(widgets-mobile/partyroom-display-board): integration #9~#10 — autoplay 차단 재armed (트랙 변경 + Mode C cross-mode mount, spec §7.2 #9/#10)"
```

### Task 4.8: 통합 #11~#12 — cross-component single source (TapToPlayButton 위치 + Mode B→A toggle GestureGate)

**Files:**

- Modify: `src/widgets-mobile/partyroom-display-board/partyroom-display-board.component.test.tsx`

- [ ] **Step 1: 케이스 추가 (2 케이스 — VideoFrame test 에서 이전됨)**

```tsx
describe('MobilePartyroomDisplayBoard · cross-component single source (VideoFrame test 에서 이전)', () => {
  test('#11 Mode B + autoplay 차단: NowPlayingRow 안에 TapToPlayButton 렌더, VideoFrame overlay 미렌더', () => {
    const { rerender } = render(<MobilePartyroomDisplayBoard partyroomId={1} />);
    // Mode B 전환
    fireEvent.click(screen.getByRole('button', { name: '영상 가리기' }));

    // autoplay 차단 시뮬: onReady 호출 후 1500ms 경과 → setAutoplayBlocked(true).
    const yt = youtubePlayerCalls[youtubePlayerCalls.length - 1];
    (yt.onReady as (p: unknown) => void)({} as unknown);
    vi.advanceTimersByTime(1500);
    rerender(<MobilePartyroomDisplayBoard partyroomId={1} />);

    const row = screen.getByTestId('now-playing-row');
    const tapButton = screen.getByRole('button', { name: '재생' });
    expect(row.contains(tapButton)).toBe(true);
    expect(screen.queryByTestId('autoplay-gesture-gate')).toBeNull();
  });

  test('#12 Mode B + autoplay 차단 → Mode A 토글 → AutoplayGestureGate overlay 즉시 visible (single source 검증)', () => {
    const { rerender } = render(<MobilePartyroomDisplayBoard partyroomId={1} />);
    fireEvent.click(screen.getByRole('button', { name: '영상 가리기' })); // Mode B 진입

    // autoplay 차단 시뮬
    const yt = youtubePlayerCalls[youtubePlayerCalls.length - 1];
    (yt.onReady as (p: unknown) => void)({} as unknown);
    vi.advanceTimersByTime(1500);
    rerender(<MobilePartyroomDisplayBoard partyroomId={1} />);

    // Mode B + 차단 상태 → TapToPlayButton visible
    expect(screen.getByRole('button', { name: '재생' })).toBeTruthy();

    // Mode A 로 토글 → gate state 그대로, 단지 mode 만 전환 → overlay 즉시 visible
    fireEvent.click(screen.getByRole('button', { name: '영상 펼치기' }));

    expect(screen.getByTestId('autoplay-gesture-gate')).toBeTruthy();
    expect(screen.queryByRole('button', { name: '재생' })).toBeNull();
  });
});
```

> **Test fragility note (last-resort fix)**: 본 plan 은 명시적 `rerender` 호출로 React state commit 을 강제. 그래도 fake timer 와 Zustand batch 의 순서 race 가 발생할 가능성이 있다 (React 18 의 automatic batching 가 microtask 경계에 의존). #11 또는 #12 가 fail 하면:
>
> 1차 fallback: `import { act } from 'react';` 후 timer 라인을 `act(() => vi.advanceTimersByTime(1500));` 로 래핑.
> 2차 fallback: 본 case 직전에 `await Promise.resolve();` 로 microtask 비움 + 함수 시그니처 `async ({...}) => {...}` 로 변경.
> 어느 fallback 도 케이스의 의도 (cross-component single source 검증) 를 해치지 않음.

- [ ] **Step 2: 테스트 실행 → GREEN (timing 실패 시 `act` 래핑 patch)**

Run: `yarn vitest run src/widgets-mobile/partyroom-display-board/partyroom-display-board.component.test.tsx 2>&1 | tail -30`
Expected: 12 tests passed.

- [ ] **Step 3: timing 실패 시 patch — `act` import + timer 라인 래핑**

만약 #11 또는 #12 가 fail (autoplay-gesture-gate / 재생 버튼 not found) 한다면, 테스트 본문의 `vi.advanceTimersByTime(1500)` 호출을 다음으로 교체:

```ts
import { act } from 'react';
// ... 본문 안에서
act(() => {
  vi.advanceTimersByTime(1500);
});
```

다시 실행 후 GREEN 확인.

- [ ] **Step 4: Commit**

```bash
git add src/widgets-mobile/partyroom-display-board/partyroom-display-board.component.test.tsx
git commit -m "test(widgets-mobile/partyroom-display-board): integration #11~#12 — cross-component single source (TapToPlayButton 위치 + Mode B→A toggle GestureGate, spec §6.5.2)"
```

### Task 4.9: Chunk 4 회귀 + lint + tsc

- [ ] **Step 1: 위젯 전체 vitest**

Run: `yarn vitest run src/widgets-mobile/partyroom-display-board/ 2>&1 | tail -30`
Expected: 7 test files (hook 1 + parts 4 + video-frame 1 + integration 1) · 58 tests passed (46 + 12 integration).

- [ ] **Step 2: 전체 unit test smoke (다른 위젯 회귀 0)**

Run: `yarn test 2>&1 | tail -20`
Expected: 모든 기존 테스트 PASS — chunk 3.1 변경 외 회귀 0.

- [ ] **Step 3: lint**

Run: `yarn lint --fix 2>&1 | tail -20`
Expected: 0 errors.

- [ ] **Step 4: tsc**

Run: `yarn tsc --noEmit -p tsconfig.json 2>&1 | tail -10`
Expected: 0 errors.

- [ ] **Step 5: clean working tree**

Run: `git status --short`
Expected: empty.

> **Chunk 4 완료.** Chunk 5 (Playwright headed + CI workflow + PR open) 으로 진행.

---

## Chunk 5: Playwright Headed E2E + CI Workflow + PR Open

> 본 chunk 는 unit/integration 레이어가 잡지 못하는 **ancestor visibility / sticky-top 높이 변화 / chat scroll 영향** 등의 ToS 가드 1차 게이트를 Playwright headed 로 추가하고, **mandatory CI job + branch protection required check** 등록 절차를 명시한다. 본 chunk 의 머지 후 chunk 3 + 3.1 단일 release 묶음으로 prod ship.
>
> **본 chunk 의 핵심 회귀 가드**:
>
> - IFrame visible (`toBeVisible()` 의 ancestor visibility 체크) + boundingBox ≥ 80×45 + viewport 안.
> - Toggle 두 번 클릭 후 같은 IFrame element (`evaluateHandle` reference equality) — remount 회피.
> - chat scroll offset 변화 ≤ `CHAT_SCROLL_TOLERANCE_PX=10` (sub-pixel rounding + 1 line-height jitter).
> - mandatory job + branch protection required check **사용자 단발 GitHub UI 작업 필수** (spec §3 row 15).

### Task 5.1: Playwright config — 모바일 project + auth fixture 분기 추가

**Files:**

- Modify: `playwright.config.ts`
- Modify: `e2e/fixtures/auth.fixtures.ts`

- [ ] **Step 1: `playwright.config.ts` 의 `projects` 배열 끝에 신규 entry 추가**

```ts
{
  name: 'display-board-tos-mobile',
  testMatch: /mobile\/display-board\.tos\.spec\.ts/,
  use: { ...devices['iPhone 13'] },
  dependencies: ['auth-a'],
},
```

> dependency 로 `auth-a` 재사용 — 신규 setup 불필요. iPhone 13 (390×844) 으로 모바일 분기 진입. Pixel 7 / iPhone SE 매트릭스는 후속 polish.

- [ ] **Step 2: `e2e/fixtures/auth.fixtures.ts` 의 `getAuthPrefix` 가 신규 spec 파일명을 인식하도록 분기 추가**

기존 `getAuthPrefix` 의 `if (testFile.includes('e2e-d.')) return 'd';` 다음에 추가:

```ts
// chunk 3.1 — 모바일 디스플레이 보드 ToS 가드. user A storage state 재사용.
if (testFile.includes('mobile/display-board')) {
  return 'a';
}
```

> 미수정 시 user1Context fixture resolve 단계에서 `throw new Error('No auth prefix configured for test file: …')` → spec 전체 RED.

- [ ] **Step 3: tsc sanity**

Run: `yarn tsc --noEmit -p tsconfig.json 2>&1 | tail -10`
Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add playwright.config.ts e2e/fixtures/auth.fixtures.ts
git commit -m "chore(playwright): display-board-tos-mobile project — iPhone 13 + auth-a 재사용 + getAuthPrefix mobile 분기 (chunk 3.1 mandatory CI)"
```

### Task 5.2: e2e helper — 모바일 룸 진입 + 재생 활성 대기

**Files:**

- Create: `e2e/mobile/display-board.helpers.ts`

- [ ] **Step 1: helper 작성 — 모바일 룸 진입 시 video-wrapper 가 visible 되기까지 대기**

```ts
// e2e/mobile/display-board.helpers.ts
import { expect, type Page } from '@playwright/test';

export const CHAT_SCROLL_TOLERANCE_PX = 10;

/** chunk 3.1 spec §4.5 Mode B 의 collapsed video 박스 픽셀 (sync 가드는 unit test). */
export const COLLAPSED_VIDEO_WIDTH = 80;
export const COLLAPSED_VIDEO_HEIGHT = 45;

/** 케이스마다 고유한 partyroom / playlist 이름 — desktop e2e-a 와 동시 사용 race 회피. */
export const mobilePartyroomName = () => `MOBILE-TOS-${Date.now()}`;
export const mobilePlaylistName = () => `mobile-tos-pl-${Date.now()}`;

/**
 * 모바일 룸 페이지로 진입 + video-wrapper 가 mount 되기까지 대기.
 * 사용자가 이미 partyroomUrl 에 도달했다고 가정 (caller 가 partyroom 생성·입장 책임).
 */
export async function gotoMobileRoomAndWaitForVideo(page: Page, partyroomUrl: string) {
  await page.goto(partyroomUrl);
  await expect(page.getByTestId('video-wrapper')).toBeVisible({ timeout: 30_000 });
}

/**
 * Playwright `toBeVisible()` 가 ancestor display/visibility/opacity 모두 체크.
 * + boundingBox 단언으로 0×0 / off-screen 회귀까지 가드.
 */
export async function expectIframeToBeOnScreen(page: Page) {
  const iframe = page.locator('iframe[src*="youtube.com/embed"]');
  await expect(iframe).toBeVisible();
  const box = await iframe.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;
  expect(box.width).toBeGreaterThanOrEqual(COLLAPSED_VIDEO_WIDTH);
  expect(box.height).toBeGreaterThanOrEqual(COLLAPSED_VIDEO_HEIGHT);
  // viewport 내부 확인 (off-screen 좌표 아님)
  const viewport = page.viewportSize();
  expect(viewport).not.toBeNull();
  if (!viewport) return;
  expect(box.x).toBeGreaterThan(-box.width);
  expect(box.y).toBeGreaterThan(-box.height);
  expect(box.x).toBeLessThan(viewport.width);
  expect(box.y).toBeLessThan(viewport.height);
}

/** Computed style 단언 — opacity > 0 && visibility !== 'hidden'. ancestor 가 가려도 잡힘. */
export async function expectIframeNotVisuallyHidden(page: Page) {
  const result = await page.locator('iframe[src*="youtube.com/embed"]').evaluate((el) => {
    const style = window.getComputedStyle(el);
    return { opacity: parseFloat(style.opacity), visibility: style.visibility };
  });
  expect(result.visibility).not.toBe('hidden');
  expect(result.opacity).toBeGreaterThan(0);
}
```

- [ ] **Step 2: tsc sanity**

Run: `yarn tsc --noEmit -p tsconfig.json 2>&1 | tail -10`
Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add e2e/mobile/display-board.helpers.ts
git commit -m "test(e2e/mobile): display-board helper — IFrame visible + boundingBox + computed style 단언 + 상수 (CHAT_SCROLL_TOLERANCE_PX, COLLAPSED_VIDEO_*)"
```

### Task 5.3: `display-board.tos.spec.ts` 본문 — Mode A/B/C IFrame 가드

**Files:**

- Create: `e2e/mobile/display-board.tos.spec.ts`

- [ ] **Step 1: spec 본문 작성 — Mode A 진입 IFrame visible / boundingBox / computed style**

```ts
// e2e/mobile/display-board.tos.spec.ts
import { expect } from '@playwright/test';
import { test } from '../fixtures/auth.fixtures';
import {
  closePartyroom,
  createPartyroom,
  createPlaylistWithTracks,
  enterPartyroomAndWaitUntilReady,
  registerAsDj,
} from '../helpers/partyroom.helpers';
import {
  CHAT_SCROLL_TOLERANCE_PX,
  COLLAPSED_VIDEO_HEIGHT,
  COLLAPSED_VIDEO_WIDTH,
  expectIframeNotVisuallyHidden,
  expectIframeToBeOnScreen,
  gotoMobileRoomAndWaitForVideo,
  mobilePartyroomName,
  mobilePlaylistName,
} from './display-board.helpers';

/**
 * chunk 3.1 spec §5 — ToS 보존 가드 (Playwright headed, mandatory CI).
 *
 * unit/integration 레이어가 잡지 못하는:
 * - ancestor visibility (parent display:none, transform scale(0), off-viewport)
 * - sticky-top 높이 변화의 chat scroll 영향
 * - IFrame 의 실제 computed style (opacity / visibility)
 *
 * iPhone 13 (390×844) 단일 매트릭스 — 추가 viewport (SE / Pixel) 는 후속 polish.
 *
 * **세션 cleanup**: 각 케이스는 createPartyroom 으로 신규 룸을 만들고 끝에 closePartyroom.
 * desktop e2e-a 와 동일 user storage state 재사용이지만 workers:1 직렬 + unique 이름으로 race 0.
 */

test('Mode A 진입: IFrame visible + boundingBox ≥ 80×45 + viewport 안 + 시각 hidden 아님', async ({
  user1Context,
}) => {
  test.setTimeout(120_000);
  const page = await user1Context.newPage();

  const partyroomUrl = await createPartyroom(page, mobilePartyroomName());
  await enterPartyroomAndWaitUntilReady(page, partyroomUrl);
  await createPlaylistWithTracks(page, mobilePlaylistName());
  await registerAsDj(page);

  await gotoMobileRoomAndWaitForVideo(page, partyroomUrl);

  await expectIframeToBeOnScreen(page);
  await expectIframeNotVisuallyHidden(page);

  await closePartyroom(page);
});

test('Mode A → Mode B 토글: wrapper 80×45 정확값 + IFrame 여전히 visible + DOM identity 보존', async ({
  user1Context,
}) => {
  test.setTimeout(120_000);
  const page = await user1Context.newPage();

  const partyroomUrl = await createPartyroom(page, mobilePartyroomName());
  await enterPartyroomAndWaitUntilReady(page, partyroomUrl);
  await createPlaylistWithTracks(page, mobilePlaylistName());
  await registerAsDj(page);
  await gotoMobileRoomAndWaitForVideo(page, partyroomUrl);

  const iframeBefore = await page.locator('iframe[src*="youtube.com/embed"]').elementHandle();
  expect(iframeBefore).not.toBeNull();

  await page.getByRole('button', { name: '영상 가리기' }).click();
  // toggle 후 ◂ 버튼 등장까지 명시적 대기 — Mode B 진입 race 회피
  await expect(page.getByRole('button', { name: '영상 펼치기' })).toBeVisible();

  const wrapper = page.getByTestId('video-wrapper');
  const wrapperBox = await wrapper.boundingBox();
  expect(wrapperBox).not.toBeNull();
  if (!wrapperBox) return;
  expect(Math.round(wrapperBox.width)).toBe(COLLAPSED_VIDEO_WIDTH);
  expect(Math.round(wrapperBox.height)).toBe(COLLAPSED_VIDEO_HEIGHT);

  await expectIframeNotVisuallyHidden(page);

  const iframeAfter = await page.locator('iframe[src*="youtube.com/embed"]').elementHandle();
  expect(iframeAfter).not.toBeNull();
  const sameElement = await page.evaluate(([a, b]) => a === b, [iframeBefore, iframeAfter]);
  expect(sameElement).toBe(true);

  await closePartyroom(page);
});

test('Mode B → Mode A 복귀: IFrame 동일 element + 16:9 wrapper 복귀', async ({ user1Context }) => {
  test.setTimeout(120_000);
  const page = await user1Context.newPage();

  const partyroomUrl = await createPartyroom(page, mobilePartyroomName());
  await enterPartyroomAndWaitUntilReady(page, partyroomUrl);
  await createPlaylistWithTracks(page, mobilePlaylistName());
  await registerAsDj(page);
  await gotoMobileRoomAndWaitForVideo(page, partyroomUrl);

  const iframeInitial = await page.locator('iframe[src*="youtube.com/embed"]').elementHandle();

  await page.getByRole('button', { name: '영상 가리기' }).click();
  // Mode B 의 ◂ 버튼 visible 보장 후 두 번째 click
  await expect(page.getByRole('button', { name: '영상 펼치기' })).toBeVisible();
  await page.getByRole('button', { name: '영상 펼치기' }).click();
  // Mode A 의 ▾ 복귀 보장
  await expect(page.getByRole('button', { name: '영상 가리기' })).toBeVisible();

  const wrapper = page.getByTestId('video-wrapper');
  await expect(wrapper).toHaveClass(/aspect-video/);

  const iframeAfter = await page.locator('iframe[src*="youtube.com/embed"]').elementHandle();
  const sameElement = await page.evaluate(([a, b]) => a === b, [iframeInitial, iframeAfter]);
  expect(sameElement).toBe(true);

  await closePartyroom(page);
});

test('Mode C (재생 없음): BlankPlaceholder visible + IFrame 미존재', async ({ user1Context }) => {
  test.setTimeout(120_000);
  const page = await user1Context.newPage();

  const partyroomUrl = await createPartyroom(page, mobilePartyroomName());
  await enterPartyroomAndWaitUntilReady(page, partyroomUrl);
  // 재생 활성화 없음 — DJ 등록 X / playlist X.

  await gotoMobileRoomAndWaitForVideo(page, partyroomUrl);

  await expect(page.getByTestId('blank-placeholder')).toBeVisible();
  await expect(page.locator('iframe[src*="youtube.com/embed"]')).toHaveCount(0);

  await closePartyroom(page);
});

test('sticky-top 높이 변화 시 chat scroll offset ≤ CHAT_SCROLL_TOLERANCE_PX 보존', async ({
  user1Context,
}) => {
  test.setTimeout(120_000);
  const page = await user1Context.newPage();

  const partyroomUrl = await createPartyroom(page, mobilePartyroomName());
  await enterPartyroomAndWaitUntilReady(page, partyroomUrl);
  await createPlaylistWithTracks(page, mobilePlaylistName());
  await registerAsDj(page);
  await gotoMobileRoomAndWaitForVideo(page, partyroomUrl);

  // chunk 3 의 partyroom-room-tabs 가 default chat 탭. 명시적 click 으로 안정화.
  const chatTab = page.getByRole('tab', { name: /채팅/ }).first();
  if (await chatTab.isVisible().catch(() => false)) {
    await chatTab.click();
  }

  // chunk 3 의 partyroom-room-tabs 컨테이너 selector — `data-tab-content='chat'` 유지 (chunk 3 그대로).
  const chatContainer = page.locator('[data-tab-content="chat"]').first();
  await expect(chatContainer).toBeVisible();

  await page.waitForTimeout(500);

  const scrollBefore = await chatContainer.evaluate((el) => el.scrollTop);

  await page.getByRole('button', { name: '영상 가리기' }).click();
  await expect(page.getByRole('button', { name: '영상 펼치기' })).toBeVisible();
  await page.waitForTimeout(300); // CSS transition 안정화 — `CHAT_SCROLL_TOLERANCE_PX` 가 sub-pixel jitter 흡수

  const scrollAfter = await chatContainer.evaluate((el) => el.scrollTop);

  const delta = Math.abs(scrollAfter - scrollBefore);
  expect(delta).toBeLessThanOrEqual(CHAT_SCROLL_TOLERANCE_PX);

  await closePartyroom(page);
});
```

- [ ] **Step 2: 로컬 brief smoke — playwright config 가 spec 을 인식하는지**

Run: `yarn playwright test --list 2>&1 | grep -i "display-board" | head -10`
Expected: 5 tests listed (Mode A / A→B / B→A / Mode C / chat scroll).

> **로컬 풀 실행은 백엔드 stack 필요** ([[reference_local_docker_compose]]). 본 task 는 list 만 검증 — 실제 e2e 실행은 CI 에서 (또는 후속 dev/stg 검증 단계). 시간 여유 시 로컬 docker compose + `yarn test:e2e:headed --project=display-board-tos-mobile` 으로 sanity.

- [ ] **Step 3: Commit**

```bash
git add e2e/mobile/display-board.tos.spec.ts
git commit -m "test(e2e/mobile): display-board.tos — 5 케이스 (Mode A IFrame visible / A↔B 토글 DOM identity / Mode C BlankPlaceholder / chat scroll offset 보존, spec §5/§7.3)"
```

### Task 5.4: CI workflow — display-board-tos-mobile project 명시 (mandatory job)

**Files:**

- Modify: `.github/workflows/vercel-preview-e2e.yml`
- Modify: `e2e/README.md`

- [ ] **Step 1: workflow 의 e2e job 에서 신규 project 실행 명시**

현재 `yarn test:e2e` 는 모든 project 를 자동 실행 — 신규 `display-board-tos-mobile` project 도 자동 포함. workflow 변경은 **명시적 표시 + 사용자 단발 GitHub UI 작업 안내** 만:

`.github/workflows/vercel-preview-e2e.yml` 의 `yarn test:e2e` 단계 직전에 주석 보강:

```yaml
# chunk 3.1: display-board-tos-mobile project (iPhone 13) 가 mandatory.
# branch protection 의 required status checks 에 "Playwright E2E" job 등록 필수
# (사용자 GitHub UI 작업, PR 본문 체크리스트). job 자체는 yarn test:e2e 안에 포함됨.
- run: yarn test:e2e
  env:
    VERCEL_AUTOMATION_BYPASS_SECRET: ${{ secrets.VERCEL_AUTOMATION_BYPASS_SECRET }}
```

- [ ] **Step 2: `e2e/README.md` 갱신 — mobile 디렉토리 + branch protection 절차**

`e2e/README.md` 끝에 추가:

```markdown
## chunk 3.1 — `e2e/mobile/` project

모바일 viewport (iPhone 13) 전용 spec 들. `display-board-tos-mobile` project 가 `playwright.config.ts` 에 등록되어 `yarn test:e2e` 의 mandatory job 으로 실행.

### `display-board.tos.spec.ts`

YouTube IFrame Player API ToS 가드 (chunk 3.1 핵심):

- Mode A IFrame visible + boundingBox ≥ 80×45 + viewport 안 + 시각 hidden 아님
- Mode A↔B 토글 시 wrapper 80×45 정확값 + IFrame DOM identity 보존 (remount 회피)
- Mode B→A 복귀 시 동일 IFrame element
- Mode C 시 BlankPlaceholder visible + IFrame 미존재
- sticky-top 높이 변화 시 chat scroll offset ≤ 10px 보존

### Branch protection 등록 (사용자 단발 GitHub UI 작업)

PR `feature/mobile-responsive-spec-3.1` 머지 **전** 다음 작업 필수 (chunk 3.1 spec §3 row 15, §10 step 6):

1. GitHub repo Settings → Branches → `develop` 의 Branch protection rule 편집
2. "Require status checks to pass before merging" 에 **`Playwright E2E`** job 추가 (이미 등록되어 있다면 OK)
3. 동일 작업을 `release` 브랜치에도 적용

본 단계 누락 시 mandatory 가 paper-only 가 됨. PR 본문 체크리스트에 명시.
```

- [ ] **Step 3: lint sanity**

Run: `yarn lint --fix e2e/ 2>&1 | tail -10`
Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/vercel-preview-e2e.yml e2e/README.md
git commit -m "ci(playwright): display-board-tos mandatory job 명시 + e2e/README branch protection 절차 (chunk 3.1 spec §3 row 15)"
```

### Task 5.5: 풀 회귀 + tsc + lint + 누락 확인

- [ ] **Step 1: 전체 unit + integration test**

Run: `yarn test 2>&1 | tail -20`
Expected: 모든 test PASS. chunk 3.1 신규 케이스 (hook 8 + parts 17 + video-frame 21 + integration 12 = 58) 포함.

- [ ] **Step 2: tsc**

Run: `yarn tsc --noEmit -p tsconfig.json 2>&1 | tail -10`
Expected: 0 errors.

- [ ] **Step 3: lint (전체)**

Run: `yarn lint 2>&1 | tail -10`
Expected: 0 errors.

- [ ] **Step 4: Playwright spec list smoke**

Run: `yarn playwright test --list 2>&1 | tail -30`
Expected: 신규 5 spec 포함, 다른 project 정상.

- [ ] **Step 5: clean working tree**

Run: `git status --short`
Expected: empty.

### Task 5.6: 최종 commit 통합 + remote push

> [[feedback_commit_consolidation_before_push]] 적용 — chunk 3.1 의 마이크로 commit 들을 logical 그룹으로 squash 또는 그대로 유지 (chunk 3.1 의 PR series 패턴 [[feedback_pr_series_workflow]] 가 atomic group 보존 선호).
>
> **결정**: chunk 별로 atomic group 보존 (chunk 1 / chunk 2 / chunk 3 / chunk 4 / chunk 5). 마이크로 commit 들은 chunk 단위로 의미 있는 단위라 squash 안 함. PR 본문 §12 에 각 chunk 매핑.

- [ ] **Step 1: 커밋 카운트 + 로그 빠른 검증**

Run: `git log origin/development..HEAD --oneline`
Expected: chunk 1~5 의 atomic commit 들 (대략 30~40개). spec 5개 + hook 9 + parts 8 (4×2 commit pair) + video-frame 9 + root + integration 6 + e2e + ci ≈ 35~40.

- [ ] **Step 2: push**

```bash
git push -u origin feature/mobile-responsive-spec-3.1
```

Expected: remote 브랜치 생성 + push 성공.

### Task 5.7: PR open (한글)

- [ ] **Step 1: PR 본문 작성 — 한글 ([[feedback_korean_issue_commit_pr]])**

```bash
gh pr create --base development --head feature/mobile-responsive-spec-3.1 --title "fix(widgets-mobile/partyroom-display-board): chunk 3.1 — YouTube IFrame ToS 보존 재설계 (3-mode + autoplay gesture gate)" --body "$(cat <<'EOF'
## 배경

chunk 2 의 모바일 디스플레이가 `1px×1px + opacity-0 + pointer-events-none` 로 YouTube IFrame 을 숨김 → **YouTube IFrame Player API 서비스 약관 위반**. prod ship 전 fix 필수 (chunk 3.1 spec §2.2).

## 변경 요약 (5 chunk)

- **Chunk 1**: \`useAutoplayGestureGate\` hook — autoplay 차단 감지 + gesture release single source. \`AUTOPLAY_DETECT_MS\` 상수 export. 데스크탑 \`video.component.tsx\` 의 inline 패턴 추출 (C3 격리, 데스크탑 0 수정).
- **Chunk 2**: 정적 parts 4개 — BlankPlaceholder, ExpandToggle, NowPlayingMeta, TapToPlayButton. 책임 분리 잠금 (wrapper class / positioning / 시각 styling 은 parent 책임).
- **Chunk 3**: \`VideoFrame\` orchestrator — 3 mode (A 풀폭 / B 80×45 / C 검정 placeholder) + wrapper-based sizing (YoutubePlayer width/height='100%' 고정, key 가 videoId/mode 미포함 → IFrame remount 회피).
- **Chunk 4**: root \`MobilePartyroomDisplayBoard\` 재설계 — 1px IFrame 본문 폐기 → VideoFrame + NowPlayingRow (NowPlayingMeta + TapToPlayButton). expanded state 토글 클릭 1곳에서만 변경.
- **Chunk 5**: Playwright headed mandatory CI — \`display-board.tos.spec.ts\` (Mode A/B/C + 토글 DOM identity + chat scroll 보존). branch protection required check 등록 (사용자 단발 GitHub UI 작업).

## ToS 보존 (spec §5)

3-layer 다중 방어:

- **unit**: YoutubePlayer width/height='100%' 단언, wrapper class `hidden`/`opacity-0`/`w-px`/`h-px`/`pointer-events-none` 부재 단언, `data-testid='video-wrapper'` 에 `aria-hidden='true'` 직접 부착 안 됨.
- **integration**: Mode 분기 + expanded 보존 invariants + cross-component single source.
- **Playwright headed (mandatory CI)**: ancestor visibility / computed style / boundingBox / viewport 안 / DOM identity / chat scroll 보존.

## 결정 잠금 (spec §3)

16 결정 잠금 — 본 PR 본문은 핵심만:

- Mode A/B/C + 우상단 ▾/◂ 토글, collapsed 80×45 (iOS HIG 44×44 hit-area 근접)
- 비재생 시 토글 hide (Mode C), expanded session-local (트랙 변경·Mode C 진입·복귀 모두 보존)
- YoutubePlayer width/height='100%' 고정 + wrapper Tailwind class 만 교체 (remount 0)
- 정적 Tailwind class only (`w-[80px]` 같은 arbitrary 정적 값. `w-[\${var}px]` runtime template 금지)
- inline 한국어 (chunk 5 i18n catch-up 시 일괄 이주)
- 데스크탑 \`widgets/partyroom-display-board/*\` 0 수정 (C3 sibling 사본)

## 테스트 (총 58 + e2e 5)

- hook 8 + parts 17 + video-frame 21 + integration 12 = **58 unit/integration**
- e2e (mandatory): 5 케이스 (Mode A / A↔B / B→A / Mode C / chat scroll)

## 체크리스트

- [x] \`yarn test\` GREEN (chunk 5 task 5.5 검증)
- [x] \`yarn tsc --noEmit\` 0 errors
- [x] \`yarn lint\` 0 errors
- [x] \`yarn playwright test --list\` 5 spec 등록 확인
- [ ] **사용자 GitHub UI 작업**: Settings → Branches → \`develop\` / \`release\` 의 required check 에 \"Playwright E2E\" 등록 (spec §3 row 15, §10 step 6). 본 단계 누락 시 mandatory 가 paper-only.
- [ ] **사용자 release 게이트**: chunk 3 (이미 develop 머지됨) 와 본 chunk 3.1 은 **단일 release 묶음으로 prod ship 필수** (spec §10 step 9). chunk 3 단독 prod 진입 시 1px×1px IFrame ToS 위반 그대로 ship — escalate.

## Spec / Plan

- Spec: \`docs/superpowers/specs/2026-05-29-mobile-display-board-tos-redesign.md\` (v4, 16 결정 잠금)
- Plan: \`docs/superpowers/plans/2026-05-29-mobile-display-board-tos-redesign.md\` (5 chunk, plan-reviewer Approved)

## Risk + 후속

- \`useAutoplayGestureGate\` (mobile) vs 데스크탑 inline 패턴 코드 중복 — chunk 3.1 머지 직후 GH 이슈 신규 등록 ("데스크탑·모바일 autoplay gesture-gate hook 통합 refactor", spec §9 risk #5).
- 추가 viewport (iPhone SE / Pixel 7) 매트릭스 — 본 PR 은 iPhone 13 단일 매트릭스. 후속 polish.

## 관련

- pfplay-web #340 (모바일 반응형 전체 스코프)
- chunk 3 PR #357 (머지됨, develop)
EOF
)" 2>&1 | tail -30
```

Expected: PR URL 출력.

- [ ] **Step 2: PR URL 캡쳐 + 사용자 보고**

PR 번호 / URL 을 메모리 갱신용으로 캡쳐. 신규 메모리 슬롯 `project_mobile_chunk31_pr_open` 작성 (Chunk 5 완료 후 별도 task 외 — execution agent 가 메모리 작성 책임).

> **Chunk 5 완료 — chunk 3.1 PR open.** 이후 단계:
>
> 1. CI green 확인 (Playwright `display-board-tos-mobile` 포함)
> 2. **사용자 GitHub UI 작업** (branch protection required check)
> 3. **사용자 머지 트리거** → develop 진입
> 4. chunk 3 (이미 develop 머지됨) + chunk 3.1 단일 release 묶음으로 release/main 승격 (사용자 트리거, spec §10 step 9)
> 5. post-merge: 메모리 갱신 ([[project_mobile_chunk3_merged_chunk31_spec_ready]] 후속 — chunk 3.1 머지 진입점) + GH 이슈 신규 등록 (autoplay hook 통합 refactor)

---
