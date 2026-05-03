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

export default function EmergencyBanner({ snapshot }: Props) {
  const t = useI18n();
  const lang = useLang();
  const isKo = lang === Language.Ko;
  const title = isKo ? snapshot.titleKo : snapshot.titleEn;
  const message = isKo ? snapshot.messageKo : snapshot.messageEn;

  // expiresAt 도달 시 시스템 만료 → cancel (사용자 dismiss 와 분리, close 버튼 없음)
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
      className='fixed top-0 inset-x-0 z-40 bg-red-700 px-4 py-3 flex items-center gap-4'
    >
      <Typography type='detail2' className='text-red-100 font-bold uppercase tracking-wider'>
        {t.system.announcement.emergency.label}
      </Typography>
      <div className='flex-1 flex flex-col gap-1'>
        <Typography type='body3' className='text-white'>
          {title}
        </Typography>
        <Typography type='detail2' className='text-red-50 whitespace-pre-line'>
          {message}
        </Typography>
      </div>
    </div>
  );
}
