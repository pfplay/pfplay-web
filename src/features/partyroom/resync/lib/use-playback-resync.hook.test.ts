vi.mock('@/entities/partyroom-client');
vi.mock('@/shared/lib/store/stores.context');
vi.mock('@/shared/api/http/services', () => ({
  partyroomsService: {
    getSetupInfo: vi.fn(),
  },
}));

import { renderHook, waitFor } from '@testing-library/react';
import { usePartyroomClient } from '@/entities/partyroom-client';
import { partyroomsService } from '@/shared/api/http/services';
import { useStores } from '@/shared/lib/store/stores.context';
import { usePlaybackResync } from './use-playback-resync.hook';

const PARTYROOM_ID = 42;

const updatePlaybackActivated = vi.fn();
const updatePlayback = vi.fn();
const updateCurrentDj = vi.fn();

let reconnectCallback: () => void;
const unregisterReconnect = vi.fn();
const onReconnect = vi.fn((cb: () => void) => {
  reconnectCallback = cb;
  return unregisterReconnect;
});

const setupInfo = {
  stageType: 'GENERAL',
  crews: [],
  display: {
    playbackActivated: true,
    playback: { linkId: 'dQw4w9WgXcQ' },
    currentDj: { crewId: 7 },
  },
} as any;

function setVisibility(state: 'visible' | 'hidden') {
  Object.defineProperty(document, 'visibilityState', { value: state, configurable: true });
}

beforeEach(() => {
  vi.clearAllMocks();
  setVisibility('visible');
  (partyroomsService.getSetupInfo as Mock).mockResolvedValue(setupInfo);
  (usePartyroomClient as Mock).mockReturnValue({ onReconnect });
  const useCurrentPartyroom = ((selector: (state: unknown) => unknown) =>
    selector({ updatePlaybackActivated, updatePlayback, updateCurrentDj })) as unknown;
  (useStores as Mock).mockReturnValue({ useCurrentPartyroom });
});

describe('usePlaybackResync', () => {
  test('visibilitychange(visible) → getSetupInfo 의 재생상태(playback/playbackActivated/currentDj)를 스토어에 주입한다', async () => {
    renderHook(() => usePlaybackResync(PARTYROOM_ID));

    document.dispatchEvent(new Event('visibilitychange'));

    await waitFor(() => expect(updatePlayback).toHaveBeenCalledWith(setupInfo.display.playback));
    expect(partyroomsService.getSetupInfo).toHaveBeenCalledWith({ partyroomId: PARTYROOM_ID });
    expect(updatePlaybackActivated).toHaveBeenCalledWith(true);
    expect(updateCurrentDj).toHaveBeenCalledWith(setupInfo.display.currentDj);
  });

  test('재연결(onReconnect 콜백 실행) → 동일하게 재생상태를 재조회·주입한다', async () => {
    renderHook(() => usePlaybackResync(PARTYROOM_ID));

    expect(onReconnect).toHaveBeenCalledTimes(1);
    reconnectCallback();

    await waitFor(() => expect(updatePlayback).toHaveBeenCalledWith(setupInfo.display.playback));
    expect(partyroomsService.getSetupInfo).toHaveBeenCalledWith({ partyroomId: PARTYROOM_ID });
  });

  test('탭이 숨겨질 때(visibilitychange + hidden)는 재조회하지 않는다', async () => {
    renderHook(() => usePlaybackResync(PARTYROOM_ID));

    setVisibility('hidden');
    document.dispatchEvent(new Event('visibilitychange'));

    await Promise.resolve();
    expect(partyroomsService.getSetupInfo).not.toHaveBeenCalled();
  });

  test('언마운트 → onReconnect 해제 함수를 호출하고 visibilitychange 리스너를 제거한다', async () => {
    const { unmount } = renderHook(() => usePlaybackResync(PARTYROOM_ID));

    unmount();
    expect(unregisterReconnect).toHaveBeenCalledTimes(1);

    document.dispatchEvent(new Event('visibilitychange'));
    await Promise.resolve();
    expect(partyroomsService.getSetupInfo).not.toHaveBeenCalled();
  });
});
