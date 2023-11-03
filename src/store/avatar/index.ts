import { create } from 'zustand';
import { AvatarParts } from '@/api/@types/Avatar';

interface SelectedAvatarStore {
  selectedBody?: AvatarParts;
  selectedFace?: AvatarParts;
  setSelectedBody: (avatarBody: AvatarParts) => void;
  setSelectedFace: (avatarFace: AvatarParts) => void;
}

export const useSelectedAvatarStore = create<SelectedAvatarStore>((set) => ({
  selectedBody: undefined,
  selectedFace: undefined,
  setSelectedBody: (avatarBody: AvatarParts) => set({ selectedBody: avatarBody }),
  setSelectedFace: (avatarFace: AvatarParts) => set({ selectedFace: avatarFace }),
}));
