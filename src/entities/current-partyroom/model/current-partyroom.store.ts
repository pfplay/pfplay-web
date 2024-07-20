'use client';

import { create } from 'zustand';
import { update } from '@/shared/lib/functions/update';
import { CurrentPartyroom } from '../model/current-partyroom.model';

const useCurrentPartyroom = create<CurrentPartyroom>((set) => ({
  djing: {
    locked: false,
  },

  setDjing: (next) => {
    return set((state) => {
      const updated = update(state.djing, next);

      return {
        djing: updated,
      };
    });
  },

  resetDjing: () => {
    return set(() => ({
      djing: {
        locked: false,
      },
    }));
  },
}));

export default useCurrentPartyroom;
