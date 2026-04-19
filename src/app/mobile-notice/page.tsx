'use client';

import Image from 'next/image';
import { useI18n } from '@/shared/lib/localization/i18n.context';

const DesktopMonitorIcon = () => (
  <svg
    width='56'
    height='56'
    viewBox='0 0 56 56'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    aria-hidden='true'
  >
    <rect x='6' y='8' width='44' height='30' rx='3' stroke='#e5e5e5' strokeWidth='2' />
    <rect x='10' y='12' width='36' height='22' rx='1' fill='#1a1a1a' />
    <line x1='20' y1='42' x2='36' y2='42' stroke='#e5e5e5' strokeWidth='2' strokeLinecap='round' />
    <line x1='28' y1='38' x2='28' y2='42' stroke='#e5e5e5' strokeWidth='2' />
    <circle cx='28' cy='23' r='5' stroke='#AE001F' strokeWidth='1.5' />
    <polygon points='26.5,21 26.5,25 30,23' fill='#AE001F' />
  </svg>
);

const Divider = () => <div className='w-[60px] h-px bg-gray-800' />;

const MobileNoticePage = () => {
  const t = useI18n();

  return (
    <div className='flex flex-col items-center gap-7 max-w-[320px] text-center'>
      <Image
        src='/images/Logo/wordmark_medium_white.png'
        width={150}
        height={36}
        alt='PFPlay'
        priority
        className='object-contain'
      />

      <Divider />

      <DesktopMonitorIcon />

      <h1 className='text-xl font-bold text-gray-200 leading-relaxed'>{t.mobileNotice.title}</h1>

      <p className='text-sm text-gray-400 leading-relaxed max-w-[280px]'>
        {t.mobileNotice.description}
      </p>

      <Divider />

      <span className='text-xs text-gray-600'>pfplay.xyz</span>
    </div>
  );
};

export default MobileNoticePage;
