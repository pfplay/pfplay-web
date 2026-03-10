import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { USER_PREFERENCES_KEY } from './constants';
import { Preference } from './user-preference.model';

export const useUserPreferenceStore = create<Preference.Model>()(
  persist(
    (set, _, api) => ({
      djingGuideHidden: false,
      setDjingGuideHidden: (hidden) => set({ djingGuideHidden: hidden }),
      volume: 0.5,
      muted: false,
      setVolume: (v) => set({ volume: v }),
      setMuted: (m) => set({ muted: m }),
      reset: () => set(api.getInitialState(), true),
    }),
    {
      name: USER_PREFERENCES_KEY,
      partialize: (state) => ({
        djingGuideHidden: state.djingGuideHidden,
        volume: state.volume,
        muted: state.muted,
      }),
    }
  )
);
