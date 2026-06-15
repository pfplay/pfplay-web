'use client';
import Image from 'next/image';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { Typography } from '@/shared/ui/components/typography';
import useBeAHost from '../lib/use-be-a-host.hook';

export default function PartyroomCreateCard() {
  const t = useI18n();
  const handleClickBeAHostBtn = useBeAHost();

  return (
    <button
      onClick={handleClickBeAHostBtn}
      className='appearance-none col-span-1 tablet:col-span-2 desktop:col-span-1 pt-6 bg-gray-900 rounded flexCol px-7 z-0 cursor-pointer text-start h-full'
      data-testid='create-partyroom-button'
    >
      <div className='items-start gap-3 flexCol'>
        <Typography type='title2' className='text-red-300'>
          {t.lobby.title.be_a_host}
        </Typography>
        <Typography type='detail1' className='text-gray-200'>
          {t.lobby.para.freely_host}
        </Typography>
      </div>
      <div className='flex-1 w-full flex items-center justify-center'>
        <Image src='/images/Background/bigPlus.png' alt='Party Room Add' width={60} height={60} />
      </div>
    </button>
  );
}
