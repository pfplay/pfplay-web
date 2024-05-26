'use client';

import Image from 'next/image';
import { useAppRouter } from '@/shared/lib/router/use-app-router.hook';
import { Button } from '@/shared/ui/components/button';
import { Typography } from '@/shared/ui/components/typography';
import { PFEdit } from '@/shared/ui/icons';
import { useFetchProfile } from '../api/use-fetch-profile.query';

type V2ViewModeProps = {
  onAvatarSettingClick?: () => void;
  changeToEditMode: () => void;
};

const V2ViewMode = ({ onAvatarSettingClick, changeToEditMode }: V2ViewModeProps) => {
  const router = useAppRouter();
  const { data: profile } = useFetchProfile();

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
          아바타 설정
        </Button>
      </div>
      <div className='justify-between flex-1 flexCol'>
        <div className='items-start gap-3 flexCol'>
          <div className='flex gap-3 items-center'>
            <Typography type='body1' className='text-white'>
              {profile?.nickname}
            </Typography>
            <div onClick={changeToEditMode} className='cursor-pointer'>
              <PFEdit />
            </div>
          </div>
          <Typography className='text-left text-white'>{profile?.introduction}</Typography>
        </div>

        <div className='items-center justify-between flexRow'>
          <div className='gap-10 flexRow'>
            <Typography type='detail1' className='items-center gap-2 text-gray-200 flexRow'>
              포인트
              {/* FIXME:<p> cannot appear as a descendant of <p>. */}
              <Typography as='span' type='body3'>
                76p
              </Typography>
            </Typography>
            <Typography type='detail1' className='items-center gap-2 text-gray-200 flexRow'>
              가입일
              <Typography as='span' type='body3'>
                76p
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
