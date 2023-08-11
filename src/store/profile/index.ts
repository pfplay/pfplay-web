import { create } from 'zustand';
import { Profile } from './profile.types';

interface ProfileStore {
  profile?: Profile;
  setProfile: (profile: Profile) => void;
  clearProfileSetting: () => void;
}

export const useProfileStore = create<ProfileStore>((set) => ({
  profile: undefined,
  setProfile: (profile: Profile) => set({ profile }),
  clearProfileSetting: () => set({ profile: undefined }),
}));
