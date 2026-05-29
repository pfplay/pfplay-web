'use client';
import { useRouter } from 'next/navigation';
import { FC } from 'react';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { Typography } from '@/shared/ui/components/typography';

const GuestCta: FC = () => {
  const t = useI18n();
  const router = useRouter();
  return (
    <button
      type='button'
      data-testid='guest-cta'
      onClick={() => router.push('/sign-in')}
      className='shrink-0 m-4 p-4 border border-gray-700 rounded text-center hover:bg-gray-900'
    >
      <Typography type='body3'>{t.partyroom.queue.guest_cta_title}</Typography>
      <Typography type='detail1' className='text-primary-300 mt-2'>
        {t.partyroom.queue.guest_cta_subtitle}
      </Typography>
    </button>
  );
};

export default GuestCta;
