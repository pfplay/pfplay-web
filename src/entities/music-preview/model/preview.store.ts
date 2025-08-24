'use client';

import { create } from 'zustand';
import { warnLog } from '@/shared/lib/functions/log/logger';
import withDebugger from '@/shared/lib/functions/log/with-debugger';
import * as Preview from './preview.model';

const logger = withDebugger(0);
const log = logger(warnLog);

export const createPreviewStore = () => {
  return create<Preview.Model>((set, get) => ({
    currentTrack: null,
    playState: 'stopped',
    playerReady: false,

    startPreview: (track) => {
      const { currentTrack, playState } = get();

      // 이미 같은 트랙이 재생중이면 무시
      if (currentTrack?.id === track.id && playState === 'playing') {
        log('이미 재생중인 트랙입니다:', track.title);
        return;
      }

      // 다른 트랙이 재생중이면 중단 후 새 트랙 재생
      if (currentTrack && currentTrack.id !== track.id) {
        log('기존 트랙 중단:', currentTrack.title, '→ 새 트랙 재생:', track.title);
      }

      set({
        currentTrack: track,
        playState: 'playing',
        playerReady: false, // 새로운 트랙 로딩 시작
      });

      log('미리보기 시작:', track.title);
    },

    stopPreview: () => {
      const { currentTrack } = get();

      if (currentTrack) {
        log('미리보기 중단:', currentTrack.title);
      }

      set({
        currentTrack: null,
        playState: 'stopped',
        playerReady: false,
      });
    },

    setPlayerReady: (ready) => {
      set({ playerReady: ready });

      if (ready) {
        const { currentTrack } = get();
        log('플레이어 준비 완료:', currentTrack?.title);
      }
    },

    isTrackPlaying: (trackId) => {
      const { currentTrack, playState } = get();
      return currentTrack?.id === trackId && playState === 'playing';
    },
  }));
};
