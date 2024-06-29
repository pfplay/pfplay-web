'use client';

import Image from 'next/image';
import { Me, useFetchMe } from '@/entities/me';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useAppRouter } from '@/shared/lib/router/use-app-router.hook';
import { Button } from '@/shared/ui/components/button';
import { Typography } from '@/shared/ui/components/typography';
import { PFEdit } from '@/shared/ui/icons';

type V2ViewModeProps = {
  onAvatarSettingClick?: () => void;
  changeToEditMode: () => void;
};

const V2ViewMode = ({ onAvatarSettingClick, changeToEditMode }: V2ViewModeProps) => {
  const t = useI18n();
  const router = useAppRouter();
  const { data: me } = useFetchMe();

  const handleClickAvatarEditButton = () => {
    router.push('/settings/avatar');
    onAvatarSettingClick?.();
  };

  return (
    <div className='gap-5 flexRow'>
      <div className='flexCol gap-9'>
        <div className='w-[108px] bg-[#1D1D1D] pointer-events-none select-none'>
          <Image
            src={'/images/Background/avatar.png'}
            alt={'profilePicture'}
            width={108}
            height={216}
          />
        </div>

        <Button size='sm' variant='outline' onClick={handleClickAvatarEditButton}>
          {t.settings.btn.addi_connection}
        </Button>
      </div>
      <div className='justify-between flex-1 flexCol'>
        <div className='items-start gap-3 flexCol'>
          <div className='flex gap-3 items-center'>
            <Typography type='body1' className='text-white'>
              {me?.nickname}
            </Typography>
            <div onClick={changeToEditMode} className='cursor-pointer'>
              <PFEdit />
            </div>
          </div>
          <Typography className='text-left text-white'>{me?.introduction}</Typography>
        </div>

        <div className='items-center justify-between flexRow'>
          <div className='gap-10 flexRow'>
            <Typography type='detail1' className='items-center gap-2 text-gray-200 flexRow'>
              {t.lobby.title.points}
              <Typography as='span' type='body3'>
                {me && Me.djScore(me)}
              </Typography>
            </Typography>
            <Typography type='detail1' className='items-center gap-2 text-gray-200 flexRow'>
              {t.lobby.title.join_date}
              <Typography as='span' type='body3'>
                {me && Me.registrationDate(me)}
              </Typography>
            </Typography>
          </div>
          <Image
            src={'/images/ETC/rainbow.png'}
            alt='rainbow'
            width={32}
            height={32}
            className='select-none pointer-events-none'
          />
        </div>
      </div>
    </div>
  );
};

export default V2ViewMode;
