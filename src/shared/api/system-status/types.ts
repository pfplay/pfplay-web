import {
  AnnouncementSnapshot,
  MaintenanceState,
} from '@/features/system-announcement/model/system-announcement.types';

export type SystemStatusResult = {
  maintenance: (MaintenanceState & { phase: 'ACTIVE' }) | null;
  activeAnnouncements: AnnouncementSnapshot[];
  plannedMaintenance: Array<MaintenanceState & { phase: 'PLANNED' }>;
};

// TODO: 백엔드에서 ws/rest api response id 명칭 통일 후 변경 필요함
type RawAnnouncement = Omit<AnnouncementSnapshot, 'announcementId'> & { id: number };

type RawSystemStatus = Omit<SystemStatusResult, 'activeAnnouncements'> & {
  activeAnnouncements: RawAnnouncement[];
};

export type SystemStatusResponse = {
  data: RawSystemStatus;
};
