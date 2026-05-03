export type AnnouncementType = 'MAINTENANCE_NOTICE' | 'EVENT' | 'EMERGENCY';
export type AnnouncementSeverity = 'INFO' | 'WARN' | 'CRITICAL';

export type AnnouncementSnapshot = {
  announcementId: number;
  type: AnnouncementType;
  severity: AnnouncementSeverity;
  titleKo: string;
  titleEn: string;
  messageKo: string;
  messageEn: string;
  scheduledStartAt: string | null;
  scheduledEndAt: string | null;
  expiresAt: string | null;
  sentAt: string;
};

export type AnnouncementPublishedEvent = AnnouncementSnapshot & {
  eventType: 'ANNOUNCEMENT_PUBLISHED';
};

export type MaintenanceStartedEvent = AnnouncementSnapshot & {
  eventType: 'MAINTENANCE_STARTED';
  type: 'MAINTENANCE_NOTICE';
  scheduledStartAt: string;
  scheduledEndAt: string;
};

export type AnnouncementCancelledEvent = {
  eventType: 'ANNOUNCEMENT_CANCELLED';
  announcementId: number;
  cancelledAt: string;
};

export type SystemAnnouncementEvent =
  | AnnouncementPublishedEvent
  | MaintenanceStartedEvent
  | AnnouncementCancelledEvent;

export type MaintenanceState = {
  phase: 'PLANNED' | 'ACTIVE';
  startAt: string;
  endAt: string;
  messageKo: string;
  messageEn: string;
};
