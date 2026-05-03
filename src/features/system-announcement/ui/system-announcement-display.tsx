'use client';

import EmergencyBanner from './emergency-banner';
import EventToast from './event-toast';
import MaintenanceOverlay from './maintenance-overlay';
import MaintenancePlannedBanner from './maintenance-planned-banner';
import { isEmergencyBanner, isPlannedNotice, isToast } from '../lib/announcement-helpers';
import { useSystemAnnouncementStore } from '../model/system-announcement.store';

/**
 * store 상태에 따라 4종 UI (overlay/planned-banner/event-toast/emergency-banner)
 * 중 해당하는 것을 동시에 다수 mount 한다. root layout 에서 한 번만 마운트.
 */
export default function SystemAnnouncementDisplay() {
  const announcements = useSystemAnnouncementStore((s) => Array.from(s.announcements.values()));
  const maintenance = useSystemAnnouncementStore((s) => s.maintenance);

  return (
    <>
      {maintenance?.phase === 'ACTIVE' && <MaintenanceOverlay maintenance={maintenance} />}
      {announcements.filter(isPlannedNotice).map((a) => (
        <MaintenancePlannedBanner key={a.announcementId} snapshot={a} />
      ))}
      {announcements.filter(isEmergencyBanner).map((a) => (
        <EmergencyBanner key={a.announcementId} snapshot={a} />
      ))}
      {announcements.filter(isToast).map((a) => (
        <EventToast key={a.announcementId} snapshot={a} />
      ))}
    </>
  );
}
