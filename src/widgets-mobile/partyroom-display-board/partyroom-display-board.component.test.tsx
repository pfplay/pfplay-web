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
