/**
 * @vitest-environment jsdom
 */
import { useRef } from 'react';
import type TReactPlayer from 'react-player';
import { render, screen, fireEvent } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import VideoFrame from './video-frame.component';
import type { AutoplayGestureGate } from '../../lib/use-autoplay-gesture-gate.hook';

// Mode C 의 BlankPlaceholder 가 useI18n 사용 → provider 없는 단위 렌더용 mock.
vi.mock('@/shared/lib/localization/i18n.context', () => ({
  useI18n: () => ({
    partyroom: {
      queue: {
        no_track: '지금 재생 중인 곡이 없어요',
        empty_cta: '지금 당장 <b>DJ 대기열</b>에서 시작해 보세요!',
      },
    },
    party: { btn: { click_to_play: '클릭하여 재생' } },
  }),
}));

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

function Harness({ videoId, gate }: { videoId: string | null; gate: AutoplayGestureGate }) {
  const playerRef = useRef<TReactPlayer | null>(null);
  return <VideoFrame videoId={videoId} playerRef={playerRef} gate={gate} />;
}

beforeEach(() => {
  youtubePlayerCalls.length = 0;
});
afterEach(() => {
  vi.clearAllMocks();
});

describe('VideoFrame · 재생 중 (videoId 있음)', () => {
  test('YoutubePlayer를 영상 ID로 렌더한다', () => {
    render(<Harness videoId='abc' gate={makeGate()} />);
    expect(youtubePlayerCalls).toHaveLength(1);
    const props = youtubePlayerCalls[0];
    expect(props.url).toBe('https://www.youtube.com/watch?v=abc');
    expect(screen.getByTestId('youtube-player-mock')).toBeTruthy();
  });

  test('재생 중에는 빈 상태와 영상 접기 컨트롤을 표시하지 않는다', () => {
    render(<Harness videoId='abc' gate={makeGate()} />);
    expect(screen.queryByRole('button', { name: /영상/ })).toBeNull();
    expect(screen.queryByTestId('blank-placeholder')).toBeNull();
  });

  test('autoplayBlocked && !played 시 AutoplayGestureGate overlay 렌더 + 클릭 시 handleGesturePlay 호출', () => {
    const handleGesturePlay = vi.fn();
    const gate = makeGate({ autoplayBlocked: true, played: false, handleGesturePlay });
    render(<Harness videoId='abc' gate={gate} />);
    const overlay = screen.getByTestId('autoplay-gesture-gate');
    fireEvent.click(overlay);
    expect(handleGesturePlay).toHaveBeenCalledTimes(1);
  });
});

describe('VideoFrame · 비재생 (videoId=null)', () => {
  test('BlankPlaceholder visible + YoutubePlayer 미렌더 + 토글 미렌더', () => {
    render(<Harness videoId={null} gate={makeGate()} />);
    expect(screen.getByTestId('blank-placeholder')).toBeTruthy();
    expect(youtubePlayerCalls).toHaveLength(0);
    expect(screen.queryByRole('button', { name: /영상/ })).toBeNull();
  });
});

describe('VideoFrame · 재생 ↔ 비재생 전환', () => {
  test('재생 → 비재생: YoutubePlayer unmount + BlankPlaceholder visible', () => {
    const { rerender } = render(<Harness videoId='abc' gate={makeGate()} />);
    expect(screen.getByTestId('youtube-player-mock')).toBeTruthy();

    rerender(<Harness videoId={null} gate={makeGate()} />);

    expect(screen.queryByTestId('youtube-player-mock')).toBeNull();
    expect(screen.getByTestId('blank-placeholder')).toBeTruthy();
  });

  test('비재생 → 재생: BlankPlaceholder unmount + YoutubePlayer mount', () => {
    const { rerender } = render(<Harness videoId={null} gate={makeGate()} />);
    expect(screen.getByTestId('blank-placeholder')).toBeTruthy();
    expect(youtubePlayerCalls).toHaveLength(0);

    rerender(<Harness videoId='abc' gate={makeGate()} />);

    expect(screen.queryByTestId('blank-placeholder')).toBeNull();
    expect(screen.getByTestId('youtube-player-mock')).toBeTruthy();
    expect(youtubePlayerCalls.length).toBeGreaterThanOrEqual(1);
  });
});

describe('VideoFrame · 접근성', () => {
  test('video-wrapper testid 에 aria-hidden="true" 직접 부착 안 됨', () => {
    render(<Harness videoId='abc' gate={makeGate()} />);
    const wrapper = screen.getByTestId('video-wrapper');
    expect(wrapper.getAttribute('aria-hidden')).toBeNull();
  });
});
