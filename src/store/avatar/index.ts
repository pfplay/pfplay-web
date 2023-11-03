import { create } from 'zustand';
import { AvatarParts } from '@/api/@types/Avatar';

export type SelectedAvatarParts = Partial<{
  body: AvatarParts;
  face: AvatarParts;
}>;

interface SelectedAvatarStore {
  selectedAvatarParts?: SelectedAvatarParts;
  setSelectedAvatarParts: (avatarParts: SelectedAvatarParts) => void;
  clearSelectedAvatarParts: () => void;
}

export const useSelectedAvatarStore = create<SelectedAvatarStore>((set) => ({
  selectedAvatarParts: undefined,
  setSelectedAvatarParts: ({ body, face }: SelectedAvatarParts) =>
    set({ selectedAvatarParts: { ...(body && { body }), ...(face && { face }) } }),
  clearSelectedAvatarParts: () => set({ selectedAvatarParts: undefined }),
}));
