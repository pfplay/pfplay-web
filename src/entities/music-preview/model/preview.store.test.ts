import type { PreviewTrack } from './preview.model';
import { createPreviewStore } from './preview.store';

const createTrack = (overrides: Partial<PreviewTrack> = {}): PreviewTrack => ({
  id: 'track-1',
  title: '테스트 곡',
  thumbnailUrl: 'https://img.youtube.com/vi/test/0.jpg',
  videoUrl: 'https://www.youtube.com/watch?v=test',
  source: 'playlist-track',
  ...overrides,
});

describe('preview store', () => {
  test('초기 상태', () => {
    const store = createPreviewStore();
    const state = store.getState();

    expect(state.currentTrack).toBeNull();
    expect(state.playState).toBe('stopped');
    expect(state.playerReady).toBe(false);
  });

  describe('startPreview', () => {
    test('트랙 재생 시작', () => {
      const store = createPreviewStore();
      const track = createTrack();

      store.getState().startPreview(track);
      const state = store.getState();

      expect(state.currentTrack).toEqual(track);
      expect(state.playState).toBe('playing');
      expect(state.playerReady).toBe(false);
    });

    test('같은 트랙이 이미 재생중이면 상태 변경 없음', () => {
      const store = createPreviewStore();
      const track = createTrack();

      store.getState().startPreview(track);
      store.getState().setPlayerReady(true);

      store.getState().startPreview(track);

      expect(store.getState().playerReady).toBe(true);
    });

    test('다른 트랙으로 전환', () => {
      const store = createPreviewStore();
      const track1 = createTrack({ id: 'track-1', title: '곡1' });
      const track2 = createTrack({ id: 'track-2', title: '곡2' });

      store.getState().startPreview(track1);
      store.getState().startPreview(track2);

      expect(store.getState().currentTrack).toEqual(track2);
      expect(store.getState().playerReady).toBe(false);
    });
  });

  describe('stopPreview', () => {
    test('재생 중단', () => {
      const store = createPreviewStore();
      store.getState().startPreview(createTrack());

      store.getState().stopPreview();
      const state = store.getState();

      expect(state.currentTrack).toBeNull();
      expect(state.playState).toBe('stopped');
      expect(state.playerReady).toBe(false);
    });
  });

  describe('setPlayerReady', () => {
    test('플레이어 준비 상태 설정', () => {
      const store = createPreviewStore();
      store.getState().startPreview(createTrack());

      store.getState().setPlayerReady(true);

      expect(store.getState().playerReady).toBe(true);
    });
  });

  describe('isTrackPlaying', () => {
    test('재생중인 트랙 ID와 일치하면 true', () => {
      const store = createPreviewStore();
      store.getState().startPreview(createTrack({ id: 'abc' }));

      expect(store.getState().isTrackPlaying('abc')).toBe(true);
    });

    test('다른 트랙 ID면 false', () => {
      const store = createPreviewStore();
      store.getState().startPreview(createTrack({ id: 'abc' }));

      expect(store.getState().isTrackPlaying('xyz')).toBe(false);
    });

    test('재생 중지 상태면 false', () => {
      const store = createPreviewStore();
      store.getState().startPreview(createTrack({ id: 'abc' }));
      store.getState().stopPreview();

      expect(store.getState().isTrackPlaying('abc')).toBe(false);
    });
  });
});
