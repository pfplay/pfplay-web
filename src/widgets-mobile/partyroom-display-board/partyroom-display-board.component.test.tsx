/**
 * @vitest-environment jsdom
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

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
