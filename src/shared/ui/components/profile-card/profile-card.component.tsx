'use client';

import Image from 'next/image';
import { ReactNode } from 'react';
import { Avatar } from '@/entities/avatar';
import { Profile } from '@/entities/profile';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { Typography } from '../typography';

type ProfileCardProps = {
  profile: Profile.Model;
  actions?: {
    avatar?: ReactNode;
    info?: ReactNode;
  };
};

export default function ProfileCard({ profile, actions }: ProfileCardProps) {
  const t = useI18n();

  return (
    <div className='gap-5 flexRow h-[284px]'>
      <div className='flexCol gap-9'>
        <div className='relative w-max min-w-[135px] h-[216px] flexRowCenter bg-[#1D1D1D] pointer-events-none select-none'>
          <Avatar
            height={180}
            bodyUri={profile.avatarBodyUri}
            faceUri={profile.avatarFaceUri}
            facePosX={profile.combinePositionX}
            facePosY={profile.combinePositionY}
          />
        </div>
        {actions?.avatar}
      </div>
      <div className='justify-between flex-1 flexCol'>
        <div className='items-start gap-3 flexCol'>
          <div className='flex gap-3 items-center'>
            <Typography type='body1' className='text-white'>
              {profile.nickname}
            </Typography>
            {actions?.info}
          </div>
          <Typography className='text-left text-white'>{profile.introduction || '-'}</Typography>
        </div>
        <div className='items-center justify-between flexRow'>
          <div className='gap-10 flexRow'>
            <Typography type='detail1' className='items-center gap-2 text-gray-200 flexRow'>
              {t.lobby.title.points}
              <Typography as='span' type='body3'>
                {`${profile.score}p`}
              </Typography>
            </Typography>
            <Typography type='detail1' className='items-center gap-2 text-gray-200 flexRow'>
              {t.lobby.title.join_date}
              <Typography as='span' type='body3'>
                {profile.registrationDate}
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
}
