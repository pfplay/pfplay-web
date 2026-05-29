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

// 후속 task 에서 사용
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
