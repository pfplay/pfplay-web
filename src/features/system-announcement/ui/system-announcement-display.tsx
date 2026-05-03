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
 *
 * fixed positioning 은 dispatcher 의 wrapping container 가 책임지고
 * 개별 컴포넌트는 normal flow 로 렌더해 stacking 이 자연스럽게 처리되도록 한다.
 */
export default function SystemAnnouncementDisplay() {
  const announcements = useSystemAnnouncementStore((s) => Array.from(s.announcements.values()));
  const maintenance = useSystemAnnouncementStore((s) => s.maintenance);

  const planned = announcements.filter(isPlannedNotice);
  const emergencies = announcements.filter(isEmergencyBanner);
  const toasts = announcements.filter(isToast);

  const hasTopStack = planned.length > 0 || emergencies.length > 0;
  const hasToastStack = toasts.length > 0;

  return (
    <>
      {maintenance?.phase === 'ACTIVE' && <MaintenanceOverlay maintenance={maintenance} />}

      {hasTopStack && (
        <div
          data-testid='system-announcement-top-stack'
          className='fixed top-3 inset-x-3 z-40 flex flex-col gap-2 pointer-events-none'
        >
          {planned.map((a) => (
            <MaintenancePlannedBanner key={a.announcementId} snapshot={a} />
          ))}
          {emergencies.map((a) => (
            <EmergencyBanner key={a.announcementId} snapshot={a} />
          ))}
        </div>
      )}

      {hasToastStack && (
        <div
          data-testid='system-announcement-toast-stack'
          className='fixed top-3 right-3 z-40 flex flex-col gap-2 pointer-events-none max-w-[calc(100%-1.5rem)]'
        >
          {toasts.map((a) => (
            <EventToast key={a.announcementId} snapshot={a} />
          ))}
        </div>
      )}
    </>
  );
}
