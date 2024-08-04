'use client';

import { create } from 'zustand';
import { update } from '@/shared/lib/functions/update';
import * as CurrentPartyroom from '../model/current-partyroom.model';

export const createCurrentPartyroomStore = () => {
  return create<CurrentPartyroom.Model>((set) => ({
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

    playbackActivated: false,
    updatePlaybackActivated: (next) => {
      return set({
        playbackActivated: next,
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

    members: [],
    updateMembers: (next) => {
      return set((state) => {
        const updated = update(state.members, next);

        return {
          members: updated,
        };
      });
    },

    notice: '',
    updateNotice: (next) => {
      return set({
        notice: next,
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
          playbackActivated: false,
          playback: undefined,
          reaction: undefined,
        },
        true
      );
    },
  }));
};
