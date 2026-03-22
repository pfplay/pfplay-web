import { ReactPlayerAPI } from './react-player.api';

function createMockPlayer(overrides?: Record<string, unknown>) {
  const internalPlayer = {
    mute: vi.fn(),
    unMute: vi.fn(),
    setVolume: vi.fn(),
  };
  return {
    seekTo: vi.fn(),
    forceUpdate: vi.fn(),
    getCurrentTime: vi.fn(() => 42),
    getDuration: vi.fn(() => 180),
    getInternalPlayer: vi.fn(() => internalPlayer),
    __internalPlayer: internalPlayer,
    ...overrides,
  } as any;
}

describe('ReactPlayerAPI', () => {
  let api: ReactPlayerAPI;

  beforeEach(() => {
    api = new ReactPlayerAPI();
  });

  describe('isReady', () => {
    test('player 설정 전에는 false를 반환한다', () => {
      expect(api.isReady()).toBe(false);
    });

    test('player 설정 후에는 true를 반환한다', () => {
      api.setPlayer(createMockPlayer());
      expect(api.isReady()).toBe(true);
    });

    test('cleanup 후에는 false를 반환한다', () => {
      api.setPlayer(createMockPlayer());
      api.cleanup();
      expect(api.isReady()).toBe(false);
    });
  });

  describe('play', () => {
    test('player가 null이면 아무 동작도 하지 않는다', () => {
      expect(() => api.play()).not.toThrow();
    });

    test('player가 있으면 seekTo(0)과 forceUpdate를 호출한다', () => {
      const player = createMockPlayer();
      api.setPlayer(player);
      api.play();
      expect(player.seekTo).toHaveBeenCalledWith(0, 'seconds');
      expect(player.forceUpdate).toHaveBeenCalled();
    });
  });

  describe('stop', () => {
    test('player가 null이면 아무 동작도 하지 않는다', () => {
      expect(() => api.stop()).not.toThrow();
    });

    test('player가 있으면 seekTo(0)을 호출한다', () => {
      const player = createMockPlayer();
      api.setPlayer(player);
      api.stop();
      expect(player.seekTo).toHaveBeenCalledWith(0, 'seconds');
    });
  });

  describe('setMuted', () => {
    test('muted=true → mute()를 호출한다', () => {
      const player = createMockPlayer();
      api.setPlayer(player);
      api.setMuted(true);
      expect(player.__internalPlayer.mute).toHaveBeenCalled();
    });

    test('muted=false → unMute()를 호출한다', () => {
      const player = createMockPlayer();
      api.setPlayer(player);
      api.setMuted(false);
      expect(player.__internalPlayer.unMute).toHaveBeenCalled();
    });

    test('internalPlayer가 null이면 아무 동작도 하지 않는다', () => {
      const player = createMockPlayer({ getInternalPlayer: vi.fn(() => null) });
      api.setPlayer(player);
      expect(() => api.setMuted(true)).not.toThrow();
    });

    test('mute가 함수가 아니면 아무 동작도 하지 않는다', () => {
      const player = createMockPlayer({
        getInternalPlayer: vi.fn(() => ({ mute: 'not-a-function' })),
      });
      api.setPlayer(player);
      expect(() => api.setMuted(true)).not.toThrow();
    });
  });

  describe('setVolume', () => {
    test('유효한 볼륨 값을 설정한다', () => {
      const player = createMockPlayer();
      api.setPlayer(player);
      api.setVolume(50);
      expect(player.__internalPlayer.setVolume).toHaveBeenCalledWith(50);
    });

    test('150 → 100으로 클램핑한다', () => {
      const player = createMockPlayer();
      api.setPlayer(player);
      api.setVolume(150);
      expect(player.__internalPlayer.setVolume).toHaveBeenCalledWith(100);
    });

    test('-5 → 0으로 클램핑한다', () => {
      const player = createMockPlayer();
      api.setPlayer(player);
      api.setVolume(-5);
      expect(player.__internalPlayer.setVolume).toHaveBeenCalledWith(0);
    });
  });

  describe('getCurrentTime', () => {
    test('player가 null이면 0을 반환한다', () => {
      expect(api.getCurrentTime()).toBe(0);
    });

    test('player가 있으면 위임값을 반환한다', () => {
      api.setPlayer(createMockPlayer());
      expect(api.getCurrentTime()).toBe(42);
    });
  });

  describe('getDuration', () => {
    test('player가 null이면 0을 반환한다', () => {
      expect(api.getDuration()).toBe(0);
    });

    test('player가 있으면 위임값을 반환한다', () => {
      api.setPlayer(createMockPlayer());
      expect(api.getDuration()).toBe(180);
    });
  });

  describe('cleanup', () => {
    test('player를 null로 초기화한다', () => {
      api.setPlayer(createMockPlayer());
      api.cleanup();
      expect(api.isReady()).toBe(false);
    });
  });
});
