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
      role='status'
      className='pointer-events-auto bg-gray-800 border border-gray-700 rounded-[6px] px-4 py-2.5 flex items-center gap-3 shadow-lg'
    >
      <span aria-hidden className='text-base leading-none'>
        🔧
      </span>
      <Typography type='detail1' className='flex-1 text-gray-100'>
        {text}
      </Typography>
      <button
        type='button'
        onClick={handleClose}
        data-testid='maintenance-planned-banner-close'
        aria-label={t.system.announcement.event.close}
        className='text-gray-400 hover:text-gray-200 leading-none px-1'
      >
        ×
      </button>
    </div>
  );
}
