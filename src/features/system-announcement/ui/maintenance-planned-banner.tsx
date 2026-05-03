'use client';

import { useI18n } from '@/shared/lib/localization/i18n.context';
import { processI18nString } from '@/shared/lib/localization/renderer/processors/variable-processor-util';
import { Typography } from '@/shared/ui/components/typography';
import { formatScheduledTime } from '../lib/announcement-helpers';
import { useSystemAnnouncementStore } from '../model/system-announcement.store';
import { AnnouncementSnapshot } from '../model/system-announcement.types';

type Props = {
  snapshot: AnnouncementSnapshot;
};

export default function MaintenancePlannedBanner({ snapshot }: Props) {
  const t = useI18n();

  if (!snapshot.scheduledStartAt) return null;

  const start = formatScheduledTime(snapshot.scheduledStartAt);
  const text = processI18nString(t.system.maintenance.planned.banner, { start });

  const handleClose = () => {
    useSystemAnnouncementStore.getState().dismiss(snapshot.announcementId);
  };

  return (
    <div
      data-testid='maintenance-planned-banner'
      className='fixed top-0 inset-x-0 z-40 bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center justify-between'
    >
      <Typography type='detail2' className='text-gray-200'>
        {text}
      </Typography>
      <button
        type='button'
        onClick={handleClose}
        data-testid='maintenance-planned-banner-close'
        className='text-gray-400 px-2'
        aria-label={t.system.announcement.event.close}
      >
        ×
      </button>
    </div>
  );
}
