'use client';

import { useEffect } from 'react';
import { cn } from '@/shared/lib/functions/cn';
import { Language } from '@/shared/lib/localization/constants';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useLang } from '@/shared/lib/localization/lang.context';
import { Typography } from '@/shared/ui/components/typography';
import { PFCampaign, PFClose } from '@/shared/ui/icons';
import { useSystemAnnouncementStore } from '../model/system-announcement.store';
import { AnnouncementSnapshot } from '../model/system-announcement.types';

type Props = {
  snapshot: AnnouncementSnapshot;
};

const SEVERITY_STYLE: Record<string, { icon: string; surface: string }> = {
  INFO: { icon: 'text-white', surface: 'bg-white/5' },
  WARN: { icon: 'text-red-200', surface: 'bg-red-200/5' },
  CRITICAL: { icon: 'text-red-300', surface: 'bg-red-300/15' },
};

export default function EventToast({ snapshot }: Props) {
  const t = useI18n();
  const severityStyle = SEVERITY_STYLE[snapshot.severity] ?? SEVERITY_STYLE.INFO;
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
      role='status'
      className={cn(
        'pointer-events-auto max-w-[640px] backdrop-blur-[10px] rounded-[10px] px-4 py-3 flex items-center gap-3 shadow-lg',
        severityStyle.surface
      )}
    >
      <PFCampaign
        width={20}
        height={20}
        data-testid='event-toast-icon'
        className={cn('shrink-0', severityStyle.icon)}
      />
      <Typography type='body3' className='text-white shrink-0'>
        {t.system.announcement.notice.label}
      </Typography>
      <Typography type='detail1' className='flex-1 min-w-0 text-gray-200 break-words'>
        <span className='text-white'>{title}</span>
        <span aria-hidden className='text-gray-400 mx-1.5'>
          ·
        </span>
        <span>{message}</span>
      </Typography>
      <button
        type='button'
        onClick={handleClose}
        data-testid='event-toast-close'
        aria-label={t.system.announcement.event.close}
        className='text-gray-200 hover:text-white shrink-0'
      >
        <PFClose width={20} height={20} />
      </button>
    </div>
  );
}
