/**
 * @vitest-environment jsdom
 */
import { useRef } from 'react';
import type TReactPlayer from 'react-player';
import { render, screen, fireEvent } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import VideoFrame, { VIDEO_WRAPPER_CLASS } from './video-frame.component';
import type { AutoplayGestureGate } from '../../lib/use-autoplay-gesture-gate.hook';

// Mode C 의 BlankPlaceholder 가 useI18n 사용 → provider 없는 단위 렌더용 mock.
vi.mock('@/shared/lib/localization/i18n.context', () => ({
  useI18n: () => ({ partyroom: { queue: { no_track: '지금 재생 중인 곡이 없어요' } } }),
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

describe('VideoFrame · VIDEO_WRAPPER_CLASS (ToS 최소 크기 가드, issue #420)', () => {
  test('전체너비 16:9 리터럴 — 썸네일 축소(w-[80px]) 금지', () => {
    expect(VIDEO_WRAPPER_CLASS).toBe('aspect-video w-full bg-black rounded');
    // ToS: viewport ≥200×200. 모바일 전체너비 16:9 가 유일한 컴플라이언트 크기.
    expect(VIDEO_WRAPPER_CLASS).not.toContain('w-[80px]');
    expect(VIDEO_WRAPPER_CLASS).not.toContain('h-[45px]');
  });
});

describe('VideoFrame · 재생 중 (videoId 있음)', () => {
  test('YoutubePlayer mount + width=100% / height=100% / url 정상', () => {
    render(<Harness videoId='abc' gate={makeGate()} />);
    expect(youtubePlayerCalls).toHaveLength(1);
    const props = youtubePlayerCalls[0];
    expect(props.width).toBe('100%');
    expect(props.height).toBe('100%');
    expect(props.url).toBe('https://www.youtube.com/watch?v=abc');
    expect(screen.getByTestId('youtube-player-mock')).toBeTruthy();
  });

  test('wrapper 가 전체너비 16:9 토큰 보유 + 접기 토글 부재 (축소 모드 제거)', () => {
    render(<Harness videoId='abc' gate={makeGate()} />);
    const wrapper = screen.getByTestId('video-wrapper');
    expect(wrapper.className).toContain('aspect-video');
    expect(wrapper.className).toContain('w-full');
    expect(wrapper.className).toContain('bg-black');
    expect(wrapper.className).toContain('rounded');
    // 접기/펼치기 토글은 80×45 축소를 만들던 비컴플라이언트 UI → 제거됨.
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

  test('wrapper 는 비재생에도 전체너비 16:9 유지', () => {
    render(<Harness videoId={null} gate={makeGate()} />);
    const wrapper = screen.getByTestId('video-wrapper');
    expect(wrapper.className).toContain('aspect-video');
    expect(wrapper.className).not.toContain('w-[80px]');
    expect(screen.queryByTestId('youtube-player-mock')).toBeNull();
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

describe('VideoFrame · ToS 가드 (회귀, issue #420)', () => {
  test.each(['playing', 'idle'] as const)(
    '%s: wrapper className 에 hidden/opacity-0/w-px/h-px/pointer-events-none 토큰 부재 + 전체너비',
    (state) => {
      const videoId = state === 'idle' ? null : 'abc';
      render(<Harness videoId={videoId} gate={makeGate()} />);
      const wrapper = screen.getByTestId('video-wrapper');
      expect(wrapper.className).not.toMatch(/\bhidden\b/);
      expect(wrapper.className).not.toMatch(/\bopacity-0\b/);
      expect(wrapper.className).not.toMatch(/\bw-px\b/);
      expect(wrapper.className).not.toMatch(/\bh-px\b/);
      expect(wrapper.className).not.toMatch(/\bpointer-events-none\b/);
      // 축소 썸네일(80×45) 토큰 부재 — viewport ≥200×200 유지.
      expect(wrapper.className).not.toMatch(/w-\[80px\]/);
      expect(wrapper.className).toContain('aspect-video');
    }
  );

  test('video-wrapper testid 에 aria-hidden="true" 직접 부착 안 됨', () => {
    render(<Harness videoId='abc' gate={makeGate()} />);
    const wrapper = screen.getByTestId('video-wrapper');
    expect(wrapper.getAttribute('aria-hidden')).toBeNull();
  });
});
