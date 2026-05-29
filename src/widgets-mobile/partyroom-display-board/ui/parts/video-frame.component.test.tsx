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

describe('VideoFrame · Mode B (재생 + collapsed)', () => {
  test('wrapper 가 wrapperClass("B") 정적 토큰 (80×45) + ExpandToggle ◂', () => {
    render(<Harness videoId='abc' expanded={false} onToggleExpand={() => {}} gate={makeGate()} />);
    const wrapper = screen.getByTestId('video-wrapper');
    expect(wrapper.className).toContain('w-[80px]');
    expect(wrapper.className).toContain('h-[45px]');
    expect(wrapper.className).toContain('shrink-0');
    expect(wrapper.className).toContain('bg-black');
    expect(screen.getByRole('button', { name: '영상 펼치기' })).toBeTruthy();
  });

  test('YoutubePlayer width=100%/height=100% 그대로 — IFrame remount 회피', () => {
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

describe('VideoFrame · Mode C (비재생, videoId=null)', () => {
  test('BlankPlaceholder visible + YoutubePlayer 미렌더 + Toggle 미렌더', () => {
    render(<Harness videoId={null} expanded={true} onToggleExpand={() => {}} gate={makeGate()} />);
    expect(screen.getByTestId('blank-placeholder')).toBeTruthy();
    expect(youtubePlayerCalls).toHaveLength(0);
    expect(screen.queryByRole('button', { name: /영상/ })).toBeNull();
  });

  test('Props 안전: videoId=null 이면 expanded=true 라도 Mode C 강제', () => {
    render(<Harness videoId={null} expanded={true} onToggleExpand={() => {}} gate={makeGate()} />);
    const wrapper = screen.getByTestId('video-wrapper');
    expect(wrapper.className).toContain('aspect-video');
    expect(wrapper.className).not.toContain('w-[80px]');
    expect(screen.queryByTestId('youtube-player-mock')).toBeNull();
  });

  test('Props 안전: videoId=null + expanded=false 도 Mode C 강제', () => {
    render(<Harness videoId={null} expanded={false} onToggleExpand={() => {}} gate={makeGate()} />);
    expect(screen.getByTestId('blank-placeholder')).toBeTruthy();
    expect(youtubePlayerCalls).toHaveLength(0);
  });
});

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

    const wrapperAfter = screen.getByTestId('video-wrapper');
    const ytAfter = screen.getByTestId('youtube-player-mock');
    expect(wrapperAfter).toBe(wrapperBefore);
    expect(ytAfter).toBe(ytBefore);
    expect(wrapperAfter.className).toContain('w-[80px]');
    expect(wrapperAfter.className).toContain('h-[45px]');
    expect(wrapperAfter.className).not.toContain('aspect-video');
  });

  test('Mode B → C 전환: YoutubePlayer unmount + BlankPlaceholder visible', () => {
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
    expect(youtubePlayerCalls.length).toBe(callsBefore);
  });

  test('Mode C → A 전환: BlankPlaceholder unmount + YoutubePlayer mount', () => {
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

  test('Mode A → C 전환: YoutubePlayer unmount + BlankPlaceholder mount (B→C 대칭, spec §7.1 #12)', () => {
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
