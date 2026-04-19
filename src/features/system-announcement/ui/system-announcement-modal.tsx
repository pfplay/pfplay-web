'use client';

import { Dialog } from '@/shared/ui/components/dialog';
import { Typography } from '@/shared/ui/components/typography';
import { useSystemAnnouncementStore } from '../model/system-announcement.store';

function formatScheduledAt(timestamp: number): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}.${month}.${day} (${dayOfWeek}) ${hours}:${minutes}`;
}

export default function SystemAnnouncementModal() {
  const currentAnnouncement = useSystemAnnouncementStore((s) => s.currentAnnouncement);
  const dismiss = useSystemAnnouncementStore((s) => s.dismiss);

  return (
    <Dialog
      open={!!currentAnnouncement}
      title={currentAnnouncement?.title}
      Sub={
        currentAnnouncement ? (
          <Typography type='detail1' className='text-gray-300 whitespace-pre-line text-center'>
            {currentAnnouncement.content}
          </Typography>
        ) : undefined
      }
      Body={
        currentAnnouncement ? (
          <>
            {currentAnnouncement.scheduledAt && (
              <div className='bg-[rgba(243,31,44,0.06)] border border-[rgba(243,31,44,0.2)] rounded-[6px] p-4 text-center'>
                <Typography
                  type='caption2'
                  className='text-red-400 font-bold tracking-wider mb-1.5'
                >
                  점검 예정 시각
                </Typography>
                <Typography type='body1' className='text-red-200'>
                  {formatScheduledAt(currentAnnouncement.scheduledAt)}
                </Typography>
              </div>
            )}

            <Dialog.ButtonGroup>
              <Dialog.Button onClick={dismiss}>확인</Dialog.Button>
            </Dialog.ButtonGroup>
          </>
        ) : (
          <></>
        )
      }
      onClose={dismiss}
    />
  );
}
