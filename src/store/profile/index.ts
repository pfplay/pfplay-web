import { create } from 'zustand';
import { UserProfile } from '@/api/@types/User';

interface ProfileStore {
  profile?: UserProfile;
  setProfile: (profile: UserProfile) => void;
  clearProfileSetting: () => void;
}

export const useProfileStore = create<ProfileStore>((set) => ({
  profile: undefined,
  setProfile: (profile: UserProfile) => set({ profile }),
  clearProfileSetting: () => set({ profile: undefined }),
}));
