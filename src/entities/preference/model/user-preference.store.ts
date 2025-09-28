import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { USER_PREFERENCES_KEY } from './constants';
import { Preference } from './user-preference.model';

export const useUserPreferenceStore = create<Preference.Model>()(
  persist(
    (set, _, api) => ({
      djingGuideHidden: false,
      setDjingGuideHidden: (hidden) => set({ djingGuideHidden: hidden }),
      reset: () => set(api.getInitialState(), true),
    }),
    {
      name: USER_PREFERENCES_KEY.HIDDEN_DJING_GUIDE,
      partialize: (state) => ({
        djingGuideHidden: state.djingGuideHidden,
      }),
    }
  )
);
