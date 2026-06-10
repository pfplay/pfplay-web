/**
 * @vitest-environment jsdom
 */
import type { ReactNode } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

// NowPlayingMeta → TrackTitle 이 react-fast-marquee + galmuriFont(next/font/local) 를
// transitive import 한다. next/font/local 은 vitest SSR 에서 함수가 아니라 모듈 로드 시
// throw → 본 스위트가 0 test 로 죽는다. video-title/now-playing-meta 테스트와 동일 패턴으로 mock.
vi.mock('react-fast-marquee', () => ({
  __esModule: true,
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));
vi.mock('@/shared/ui/foundation/fonts', () => ({ galmuriFont: { className: 'font-galmuri' } }));
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

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock('@/features/partyroom/get-summary', () => ({
  useFetchPartyroomDetailSummary: () => ({ data: { title: 'Test Room' } }),
}));

vi.mock('@/entities/preference', () => ({
  useUserPreferenceStore: vi.fn((selector: (s: { volume: number; muted: boolean }) => unknown) =>
    selector({ volume: 1, muted: false })
  ),
}));

vi.mock('./ui/parts/action-buttons.component', () => ({
  __esModule: true,
  default: () => <div data-testid='action-buttons-mock' />,
}));

type StoreState = {
  playbackActivated: boolean;
  // PartyroomPlayback 형식 정합: id/thumbnailImage 는 모바일 widget 이 사용 안 하지만,
  // endTime 은 seekToLive 가 getInitialSeek(endTime - now) 으로 사용하므로 필수.
  playback: {
    name: string;
    duration: string;
    linkId: string;
    endTime: number;
    id?: number;
    thumbnailImage?: string;
  } | null;
  currentDj: { crewId: number } | null;
  crews: Array<{ crewId: number; nickname: string }>;
};

// 미래 시각 → getInitialSeek 가 양수 elapsed 반환하지만 mock seekTo 는 호출만 추적.
const FUTURE_END_TIME = Date.now() + 60_000;

let storeState: StoreState = {
  playbackActivated: true,
  playback: { name: 'Track 1', duration: '3:30', linkId: 'abc', endTime: FUTURE_END_TIME },
  currentDj: { crewId: 1 },
  crews: [{ crewId: 1, nickname: 'DJ A' }],
};

// react-player onReady 콜백에 넘기는 mock player.
// seekToLive 가 playerRef.current?.seekTo 를 호출하므로 vi.fn 으로 stub 필요 (회귀 fix #382 invariant).
function makeMockPlayer() {
  return { seekTo: vi.fn() } as unknown;
}

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
    playback: { name: 'Track 1', duration: '3:30', linkId: 'abc', endTime: FUTURE_END_TIME },
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

describe('MobilePartyroomDisplayBoard · 토글 라이프사이클', () => {
  test('#1 룸 mount 시 expanded=true default → Mode A 진입', () => {
    render(<MobilePartyroomDisplayBoard partyroomId={1} />);
    const wrapper = screen.getByTestId('video-wrapper');
    expect(wrapper.className).toContain('aspect-video');
    expect(wrapper.className).toContain('w-full');
    expect(screen.getByRole('button', { name: '영상 가리기' })).toBeTruthy();
  });

  test('#2 토글 클릭 → Mode B (80×45)', () => {
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
    expect(screen.getByRole('button', { name: '영상 가리기' })).toBeTruthy();
  });
});

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

describe('MobilePartyroomDisplayBoard · expanded 보존 invariants', () => {
  test('#5 토글 B → playback 트랙 변경 → expanded=false 그대로', () => {
    const { rerender } = render(<MobilePartyroomDisplayBoard partyroomId={1} />);
    fireEvent.click(screen.getByRole('button', { name: '영상 가리기' }));
    expect(screen.getByTestId('video-wrapper').className).toContain('w-[80px]');

    setStoreState({ playback: { name: 'Track 2', duration: '4:00', linkId: 'def' } });
    rerender(<MobilePartyroomDisplayBoard partyroomId={1} />);

    expect(screen.getByTestId('video-wrapper').className).toContain('w-[80px]');
    expect(screen.getByTestId('video-wrapper').className).toContain('h-[45px]');
    expect(screen.getByRole('button', { name: '영상 펼치기' })).toBeTruthy();
  });

  test('#6 Mode B → playback null → playback 재할당 → 여전히 Mode B (사용자 선택 보존)', () => {
    const { rerender } = render(<MobilePartyroomDisplayBoard partyroomId={1} />);
    fireEvent.click(screen.getByRole('button', { name: '영상 가리기' }));

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

  test('#7 Mode A → Mode C → 재할당 → Mode A 복귀 (역대칭)', () => {
    const { rerender } = render(<MobilePartyroomDisplayBoard partyroomId={1} />);
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

describe('MobilePartyroomDisplayBoard · component lifecycle', () => {
  test('#8 룸 unmount → 다시 mount → expanded=true reset (component-local state)', () => {
    const { unmount } = render(<MobilePartyroomDisplayBoard partyroomId={1} />);
    fireEvent.click(screen.getByRole('button', { name: '영상 가리기' }));
    expect(screen.getByTestId('video-wrapper').className).toContain('w-[80px]');

    unmount();

    render(<MobilePartyroomDisplayBoard partyroomId={1} />);
    expect(screen.getByTestId('video-wrapper').className).toContain('aspect-video');
    expect(screen.getByRole('button', { name: '영상 가리기' })).toBeTruthy();
  });
});

describe('MobilePartyroomDisplayBoard · autoplay 차단 회귀', () => {
  test('#9 트랙 변경 시 autoplay 차단 재armed: 새 videoId + 1500ms 후 차단 → release control 렌더', () => {
    const { rerender } = render(<MobilePartyroomDisplayBoard partyroomId={1} />);

    const firstYt = youtubePlayerCalls[0];
    act(() => {
      (firstYt.onReady as (p: unknown) => void)(makeMockPlayer());
      (firstYt.onPlay as () => void)();
    });

    setStoreState({ playback: { name: 'Track 2', duration: '4:00', linkId: 'def' } });
    rerender(<MobilePartyroomDisplayBoard partyroomId={1} />);

    const newYt = youtubePlayerCalls[youtubePlayerCalls.length - 1];
    act(() => {
      (newYt.onReady as (p: unknown) => void)(makeMockPlayer());
    });
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    rerender(<MobilePartyroomDisplayBoard partyroomId={1} />);

    expect(screen.queryByTestId('autoplay-gesture-gate')).toBeTruthy();
  });

  test('#10 Mode C → 재할당 → onReady 후 1500ms 내 onPlay 없으면 차단 + release control 렌더', () => {
    setStoreState({ playbackActivated: false, playback: null });
    const { rerender } = render(<MobilePartyroomDisplayBoard partyroomId={1} />);
    expect(screen.getByTestId('blank-placeholder')).toBeTruthy();

    setStoreState({
      playbackActivated: true,
      playback: { name: 'Track 5', duration: '3:00', linkId: 'mno' },
    });
    rerender(<MobilePartyroomDisplayBoard partyroomId={1} />);

    const yt = youtubePlayerCalls[youtubePlayerCalls.length - 1];
    act(() => {
      (yt.onReady as (p: unknown) => void)(makeMockPlayer());
    });
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    rerender(<MobilePartyroomDisplayBoard partyroomId={1} />);

    expect(screen.queryByTestId('autoplay-gesture-gate')).toBeTruthy();
  });
});

describe('MobilePartyroomDisplayBoard · 헤더', () => {
  test('헤더: 뒤로 버튼 클릭 시 /parties 라우팅 + PF 아이콘 렌더', () => {
    render(<MobilePartyroomDisplayBoard partyroomId={1} />);
    const back = screen.getByRole('button', { name: '뒤로' });
    expect(back.querySelector('svg')).toBeTruthy(); // PFArrowLeft
    fireEvent.click(back);
    expect(mockPush).toHaveBeenCalledWith('/parties');
    const menu = screen.getByRole('button', { name: '메뉴' });
    expect(menu.querySelector('svg')).toBeTruthy(); // PFMoreVert
  });
});

describe('MobilePartyroomDisplayBoard · cross-component single source', () => {
  test('#11 Mode B + autoplay 차단: NowPlayingRow 안에 TapToPlayButton 렌더, overlay 미렌더', () => {
    const { rerender } = render(<MobilePartyroomDisplayBoard partyroomId={1} />);
    fireEvent.click(screen.getByRole('button', { name: '영상 가리기' }));

    const yt = youtubePlayerCalls[youtubePlayerCalls.length - 1];
    act(() => {
      (yt.onReady as (p: unknown) => void)(makeMockPlayer());
    });
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    rerender(<MobilePartyroomDisplayBoard partyroomId={1} />);

    const row = screen.getByTestId('now-playing-row');
    const tapButton = screen.getByRole('button', { name: '재생' });
    expect(row.contains(tapButton)).toBe(true);
    expect(screen.queryByTestId('autoplay-gesture-gate')).toBeNull();
  });

  test('#12 Mode B + autoplay 차단 → Mode A 토글 → overlay 즉시 visible (single source)', () => {
    const { rerender } = render(<MobilePartyroomDisplayBoard partyroomId={1} />);
    fireEvent.click(screen.getByRole('button', { name: '영상 가리기' }));

    const yt = youtubePlayerCalls[youtubePlayerCalls.length - 1];
    act(() => {
      (yt.onReady as (p: unknown) => void)(makeMockPlayer());
    });
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    rerender(<MobilePartyroomDisplayBoard partyroomId={1} />);

    expect(screen.getByRole('button', { name: '재생' })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: '영상 펼치기' }));

    expect(screen.getByTestId('autoplay-gesture-gate')).toBeTruthy();
    expect(screen.queryByRole('button', { name: '재생' })).toBeNull();
  });
});
