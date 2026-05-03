export type SystemAnnouncementType = 'MAINTENANCE';

export type SystemAnnouncementEvent = {
  id: string;
  type: SystemAnnouncementType;
  title: string;
  content: string;
  scheduledAt?: number; // UTC timestamp (ms)
};
