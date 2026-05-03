import { create } from 'zustand';
import { SystemAnnouncementEvent } from './system-announcement.types';

type SystemAnnouncementState = {
  currentAnnouncement: SystemAnnouncementEvent | null;
  dismissedIds: Set<string>;
  showAnnouncement: (event: SystemAnnouncementEvent) => void;
  dismiss: () => void;
  isDismissed: (id: string) => boolean;
};

export const createSystemAnnouncementStore = () => {
  return create<SystemAnnouncementState>((set, get) => ({
    currentAnnouncement: null,
    dismissedIds: new Set<string>(),

    showAnnouncement: (event) => {
      if (get().dismissedIds.has(event.id)) return;
      set({ currentAnnouncement: event });
    },

    dismiss: () => {
      const current = get().currentAnnouncement;
      if (!current) return;

      const nextDismissed = new Set(get().dismissedIds);
      nextDismissed.add(current.id);
      set({ currentAnnouncement: null, dismissedIds: nextDismissed });
    },

    isDismissed: (id) => get().dismissedIds.has(id),
  }));
};

/**
 * 모듈 스코프 싱글턴 — SystemAnnouncementModal에서 직접 import하여 사용
 */
export const useSystemAnnouncementStore = createSystemAnnouncementStore();
