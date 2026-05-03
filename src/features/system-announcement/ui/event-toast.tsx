'use client';

import { useEffect } from 'react';
import { Language } from '@/shared/lib/localization/constants';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useLang } from '@/shared/lib/localization/lang.context';
import { Typography } from '@/shared/ui/components/typography';
import { useSystemAnnouncementStore } from '../model/system-announcement.store';
import { AnnouncementSnapshot } from '../model/system-announcement.types';

type Props = {
  snapshot: AnnouncementSnapshot;
};

export default function EventToast({ snapshot }: Props) {
  const t = useI18n();
  const lang = useLang();
  const isKo = lang === Language.Ko;
  const title = isKo ? snapshot.titleKo : snapshot.titleEn;
  const message = isKo ? snapshot.messageKo : snapshot.messageEn;

  // expiresAt 도달은 시스템 만료 → cancel (사용자 close 와 의미 분리)
  useEffect(() => {
    if (!snapshot.expiresAt) return;
    const remaining = new Date(snapshot.expiresAt).getTime() - Date.now();
    if (remaining <= 0) {
      useSystemAnnouncementStore.getState().cancel(snapshot.announcementId);
      return;
    }
    const timer = setTimeout(() => {
      useSystemAnnouncementStore.getState().cancel(snapshot.announcementId);
    }, remaining);
    return () => clearTimeout(timer);
  }, [snapshot.announcementId, snapshot.expiresAt]);

  const handleClose = () => {
    useSystemAnnouncementStore.getState().dismiss(snapshot.announcementId);
  };

  return (
    <div
      data-testid='event-toast'
      className='fixed top-4 right-4 z-40 bg-gray-800 border border-gray-700 rounded-[6px] px-4 py-3 max-w-[360px] flex flex-col gap-1'
    >
      <Typography type='body3' className='text-gray-50'>
        {title}
      </Typography>
      <Typography type='detail2' className='text-gray-300 whitespace-pre-line'>
        {message}
      </Typography>
      <button
        type='button'
        onClick={handleClose}
        data-testid='event-toast-close'
        className='self-end text-gray-400 mt-1 text-xs'
      >
        {t.system.announcement.event.close}
      </button>
    </div>
  );
}
