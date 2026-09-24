'use client';

import { useEffect } from 'react';
import { Language } from '@/shared/lib/localization/constants';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useLang } from '@/shared/lib/localization/lang.context';
import { Typography } from '@/shared/ui/components/typography';
import { PFClose } from '@/shared/ui/icons';
import { useSystemAnnouncementStore } from '../model/system-announcement.store';
import { AnnouncementSnapshot } from '../model/system-announcement.types';

type Props = {
  snapshot: AnnouncementSnapshot;
};

export default function EmergencyBanner({ snapshot }: Props) {
  const t = useI18n();
  const lang = useLang();
  const isKo = lang === Language.Ko;
  const title = isKo ? snapshot.titleKo : snapshot.titleEn;
  const message = isKo ? snapshot.messageKo : snapshot.messageEn;

  const handleClose = () => {
    useSystemAnnouncementStore.getState().dismiss(snapshot.announcementId);
  };

  // expiresAt 도달 시 시스템 만료 → cancel (사용자 dismiss 와 의미 분리)
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

  return (
    <div
      data-testid='emergency-banner'
      role='alert'
      className='pointer-events-auto bg-gradient-red rounded-[6px] px-4 py-3 flex items-center gap-3 shadow-lg'
    >
      <span aria-hidden className='text-lg leading-none'>
        ⚠️
      </span>
      <Typography
        type='caption1'
        className='uppercase tracking-wider font-bold text-red-50 shrink-0'
      >
        {t.system.announcement.emergency.label}
      </Typography>
      <div className='w-px h-4 bg-red-50/40 shrink-0' aria-hidden />
      <div className='flex-1 flex flex-col gap-0.5 min-w-0'>
        <Typography type='body3' className='break-words whitespace-pre-line text-white'>
          {title}
        </Typography>
        <Typography type='detail2' className='text-red-50/90 whitespace-pre-line'>
          {message}
        </Typography>
      </div>
      <button
        type='button'
        onClick={handleClose}
        data-testid='emergency-banner-close'
        aria-label={t.system.announcement.event.close}
        className='shrink-0 text-red-50 hover:text-white'
      >
        <PFClose width={20} height={20} />
      </button>
    </div>
  );
}
