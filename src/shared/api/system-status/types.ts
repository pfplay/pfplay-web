import {
  AnnouncementSnapshot,
  MaintenanceState,
} from '@/features/system-announcement/model/system-announcement.types';

export type SystemStatusResult = {
  maintenance: (MaintenanceState & { phase: 'ACTIVE' }) | null;
  activeAnnouncements: AnnouncementSnapshot[];
  plannedMaintenance: Array<MaintenanceState & { phase: 'PLANNED' }>;
};

export type SystemStatusResponse = {
  result: SystemStatusResult;
};
