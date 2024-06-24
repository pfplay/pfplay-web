import { create } from 'zustand';
import { AvatarParts } from '@/shared/api/types/avatar';

type SelectedAvatarParts = Partial<{
  body: AvatarParts;
  face: AvatarParts;
}>;

interface SelectedAvatarStore {
  selectedAvatarParts?: SelectedAvatarParts;
  setSelectedAvatarParts: (avatarParts: SelectedAvatarParts) => void;
  clearSelectedAvatarParts: () => void;
}

/**
 * TODO: 사용부에서 local state로 들고 있으면 될 듯. global store로 관리할 필요 없어보임.
 */
export const useSelectedAvatarStore = create<SelectedAvatarStore>((set) => ({
  selectedAvatarParts: undefined,
  setSelectedAvatarParts: ({ body, face }: SelectedAvatarParts) =>
    set({ selectedAvatarParts: { ...(body && { body }), ...(face && { face }) } }),
  clearSelectedAvatarParts: () => set({ selectedAvatarParts: undefined }),
}));
