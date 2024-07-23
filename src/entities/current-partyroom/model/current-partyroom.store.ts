'use client';

import { create } from 'zustand';
import { update } from '@/shared/lib/functions/update';
import { CurrentPartyroom } from '../model/current-partyroom.model';

const useCurrentPartyroom = create<CurrentPartyroom>((set) => ({
  id: undefined,

  me: undefined,
  updateMe: (next) => {
    return set((state) => {
      const updated = update(state.me, next);

      return {
        me: updated,
      };
    });
  },

  isPlaybackActivated: false,
  updatePlaybackActivated: (next) => {
    return set((state) => {
      const updated = update(state.isPlaybackActivated, next);

      return {
        isPlaybackActivated: updated,
      };
    });
  },

  playback: undefined,
  updatePlayback: (next) => {
    return set((state) => {
      const updated = update(state.playback, next);

      return {
        playback: updated,
      };
    });
  },

  reaction: undefined,
  updateReaction: (next) => {
    return set((state) => {
      const updated = update(state.reaction, next);

      return {
        reaction: updated,
      };
    });
  },

  init: (next) => {
    return set(next, true);
  },

  reset: () => {
    return set(
      {
        id: undefined,
        me: undefined,
        isPlaybackActivated: false,
        playback: undefined,
        reaction: undefined,
      },
      true
    );
  },
}));

export default useCurrentPartyroom;
