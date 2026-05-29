/**
 * @vitest-environment jsdom
 */
import { useRef } from 'react';
import type TReactPlayer from 'react-player';
import { render, screen, fireEvent } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import VideoFrame, {
  COLLAPSED_VIDEO_HEIGHT,
  COLLAPSED_VIDEO_WIDTH,
  wrapperClass,
} from './video-frame.component';
import type { AutoplayGestureGate } from '../../lib/use-autoplay-gesture-gate.hook';

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

// silence unused-import lint warnings until later tasks add tests
void VideoFrame;
void Harness;
void render;
void screen;
void fireEvent;
void makeGate;

describe('VideoFrame · wrapperClass (정적 리터럴 가드, spec §4.5)', () => {
  test('Mode A 리터럴', () => {
    expect(wrapperClass('A')).toBe('aspect-video w-full bg-black rounded');
  });
  test('Mode B 리터럴: w-[80px] h-[45px] shrink-0 bg-black rounded — Tailwind JIT 정적 scan 안전', () => {
    expect(wrapperClass('B')).toBe('w-[80px] h-[45px] shrink-0 bg-black rounded');
  });
  test('Mode C 리터럴', () => {
    expect(wrapperClass('C')).toBe('aspect-video w-full bg-black rounded');
  });
  test('JS 상수 ↔ wrapperClass(B) 정적 리터럴 sync — 상수만 바뀌면 fail', () => {
    expect(wrapperClass('B')).toContain(`w-[${COLLAPSED_VIDEO_WIDTH}px]`);
    expect(wrapperClass('B')).toContain(`h-[${COLLAPSED_VIDEO_HEIGHT}px]`);
  });
});
