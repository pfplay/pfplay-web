jest.mock('@/shared/lib/functions/log/with-debugger', () => ({
  __esModule: true,
  default: () => (fn: any) => fn,
}));

jest.mock('@/shared/lib/functions/log/logger', () => ({
  warnLog: jest.fn(),
}));

import { warnLog } from '@/shared/lib/functions/log/logger';
import { createUIStateStore } from './ui-state.store';

const mockedWarnLog = warnLog as jest.Mock;

describe('ui-state store', () => {
  beforeEach(() => jest.clearAllMocks());

  test('초기 상태: open=false, interactable=true, zIndex=30, selectedPlaylist=undefined', () => {
    const store = createUIStateStore();
    const { playlistDrawer } = store.getState();

    expect(playlistDrawer.open).toBe(false);
    expect(playlistDrawer.interactable).toBe(true);
    expect(playlistDrawer.zIndex).toBe(30);
    expect(playlistDrawer.selectedPlaylist).toBeUndefined();
  });

  describe('setPlaylistDrawer', () => {
    test('open을 true로 변경한다', () => {
      const store = createUIStateStore();

      store.getState().setPlaylistDrawer({ open: true });

      const { playlistDrawer } = store.getState();
      expect(playlistDrawer.open).toBe(true);
      expect(playlistDrawer.interactable).toBe(true);
      expect(playlistDrawer.zIndex).toBe(30);
    });

    test('open=true일 때 interactable과 zIndex를 변경할 수 있다', () => {
      const store = createUIStateStore();

      store.getState().setPlaylistDrawer({ open: true, interactable: false, zIndex: 50 });

      const { playlistDrawer } = store.getState();
      expect(playlistDrawer.open).toBe(true);
      expect(playlistDrawer.interactable).toBe(false);
      expect(playlistDrawer.zIndex).toBe(50);
    });

    test('open=false로 변경하면 interactable, zIndex, selectedPlaylist가 자동 초기화된다', () => {
      const store = createUIStateStore();

      // 먼저 drawer를 열고 값 변경
      store.getState().setPlaylistDrawer({
        open: true,
        interactable: false,
        zIndex: 999,
        selectedPlaylist: {
          id: 1,
          name: '테스트',
          orderNumber: 1,
          type: 'PLAYLIST' as any,
          musicCount: 5,
        },
      });

      // drawer 닫기
      store.getState().setPlaylistDrawer({ open: false });

      const { playlistDrawer } = store.getState();
      expect(playlistDrawer.open).toBe(false);
      expect(playlistDrawer.interactable).toBe(true);
      expect(playlistDrawer.zIndex).toBe(30);
      expect(playlistDrawer.selectedPlaylist).toBeUndefined();
    });

    test('open=false일 때 초기값과 다른 값이 있으면 warnLog를 호출한다', () => {
      const store = createUIStateStore();

      // drawer를 열고 값 변경
      store.getState().setPlaylistDrawer({
        open: true,
        interactable: false,
        zIndex: 999,
      });

      // drawer 닫기 - 변경된 interactable과 zIndex에 대해 warnLog 호출 예상
      store.getState().setPlaylistDrawer({ open: false });

      expect(mockedWarnLog).toHaveBeenCalledWith(expect.stringContaining('interactable'));
      expect(mockedWarnLog).toHaveBeenCalledWith(expect.stringContaining('zIndex'));
    });

    test('open=false일 때 값이 이미 초기값이면 warnLog를 호출하지 않는다', () => {
      const store = createUIStateStore();

      // drawer를 열었다가 값 변경 없이 닫기
      store.getState().setPlaylistDrawer({ open: true });
      store.getState().setPlaylistDrawer({ open: false });

      // interactable, zIndex, selectedPlaylist 모두 이미 초기값이므로 로그 없음
      expect(mockedWarnLog).not.toHaveBeenCalled();
    });
  });
});
