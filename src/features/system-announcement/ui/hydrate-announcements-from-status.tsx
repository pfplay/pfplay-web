'use client';

import { useEffect } from 'react';
import { useSystemAnnouncementStore } from '../model/system-announcement.store';
import { AnnouncementSnapshot, MaintenanceState } from '../model/system-announcement.types';

type Props = {
  initialActive: AnnouncementSnapshot[];
  initialMaintenance: MaintenanceState | null;
};

/**
 * root layout server component 에서 fetch 한 /v1/system/status 결과를
 * client store 에 주입한다. WS 도착 전에도 active 공지를 미리 표시하기 위함.
 */
export default function HydrateAnnouncementsFromStatus({
  initialActive,
  initialMaintenance,
}: Props) {
  useEffect(() => {
    const store = useSystemAnnouncementStore.getState();
    initialActive.forEach((a) => store.add(a));
    if (initialMaintenance) store.setMaintenance(initialMaintenance);
  }, [initialActive, initialMaintenance]);

  return null;
}
