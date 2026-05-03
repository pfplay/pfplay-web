'use client';

import { Language } from '@/shared/lib/localization/constants';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useLang } from '@/shared/lib/localization/lang.context';
import { Typography } from '@/shared/ui/components/typography';
import { MaintenanceState } from '../model/system-announcement.types';

type Props = {
  maintenance: MaintenanceState;
};

export default function MaintenanceOverlay({ maintenance }: Props) {
  const t = useI18n();
  const lang = useLang();
  const message = lang === Language.Ko ? maintenance.messageKo : maintenance.messageEn;

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div
      data-testid='maintenance-overlay'
      className='fixed inset-0 z-50 bg-black flex flex-col items-center justify-center px-6 text-center'
    >
      <div className='w-[80px] h-[80px] bg-gradient-red rounded-full flexColCenter mb-5'>
        <span className='text-[36px]'>🔧</span>
      </div>

      <Typography type='title1' className='text-gray-50 mb-5'>
        {t.system.maintenance.active.title}
      </Typography>

      <Typography type='detail1' className='text-gray-400 whitespace-pre-line max-w-[480px] mb-8'>
        {message}
      </Typography>

      <button
        type='button'
        onClick={handleRetry}
        data-testid='maintenance-overlay-retry'
        className='bg-gradient-red text-white px-6 py-3 rounded-[4px]'
      >
        {t.system.maintenance.active.retry}
      </button>
    </div>
  );
}
