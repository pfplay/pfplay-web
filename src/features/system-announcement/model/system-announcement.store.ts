import { create } from 'zustand';
import { AnnouncementSnapshot, MaintenanceState } from './system-announcement.types';

type SystemAnnouncementState = {
  announcements: Map<number, AnnouncementSnapshot>;
  dismissedIds: Set<number>;
  maintenance: MaintenanceState | null;
  add: (snapshot: AnnouncementSnapshot) => void;
  cancel: (announcementId: number) => void;
  dismiss: (announcementId: number) => void;
  setMaintenance: (state: MaintenanceState | null) => void;
};

export const createSystemAnnouncementStore = () =>
  create<SystemAnnouncementState>((set, get) => ({
    announcements: new Map(),
    dismissedIds: new Set(),
    maintenance: null,

    add: (snapshot) => {
      if (get().dismissedIds.has(snapshot.announcementId)) return;
      const next = new Map(get().announcements);
      next.set(snapshot.announcementId, snapshot);
      set({ announcements: next });
    },

    cancel: (announcementId) => {
      const next = new Map(get().announcements);
      next.delete(announcementId);
      set({ announcements: next });
    },

    dismiss: (announcementId) => {
      const nextActive = new Map(get().announcements);
      nextActive.delete(announcementId);
      const nextDismissed = new Set(get().dismissedIds);
      nextDismissed.add(announcementId);
      set({ announcements: nextActive, dismissedIds: nextDismissed });
    },

    setMaintenance: (state) => set({ maintenance: state }),
  }));

/**
 * 모듈 스코프 싱글턴 — UI/subscription에서 직접 import하여 사용
 */
export const useSystemAnnouncementStore = createSystemAnnouncementStore();
