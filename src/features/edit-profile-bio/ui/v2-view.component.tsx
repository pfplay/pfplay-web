'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Avatar } from '@/entities/avatar';
import { BASE_SCALE, BASE_X, BASE_Y } from '@/entities/avatar/config/base-size';
import { Me, useSuspenseFetchMe } from '@/entities/me';
import { ActivityType } from '@/shared/api/http/types/@enums';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { Button } from '@/shared/ui/components/button';
import { Typography } from '@/shared/ui/components/typography';
import { PFEdit } from '@/shared/ui/icons';

type V2ViewModeProps = {
  onAvatarSettingClick?: () => void;
  changeToEditMode: () => void;
};

const V2ViewMode = ({ onAvatarSettingClick, changeToEditMode }: V2ViewModeProps) => {
  const t = useI18n();
  const { data: me } = useSuspenseFetchMe();

  return (
    <div className='flex flex-col gap-5 sm:flex-row'>
      <div className='flex flex-col gap-4 sm:gap-9'>
        <div
          className='flex h-[120px] w-full items-center justify-center bg-[#1D1D1D] pointer-events-none select-none sm:h-[216px] sm:w-max'
          data-testid='my-profile-avatar-preview'
          data-avatar-body-uri={me.avatarBodyUri ?? ''}
        >
          {!!me.avatarBodyUri && (
            <div className='scale-[0.66] sm:scale-100'>
              <Avatar
                height={180}
                bodyUri={me.avatarBodyUri}
                compositionType={me.avatarCompositionType}
                faceUri={me.avatarFaceUri}
                facePosX={me.combinePositionX}
                facePosY={me.combinePositionY}
                offsetX={me.offsetX || BASE_X}
                offsetY={me.offsetY || BASE_Y}
                scale={me.scale || BASE_SCALE}
              />
            </div>
          )}
        </div>

        <Button
          size='sm'
          variant='outline'
          onClick={onAvatarSettingClick}
          data-testid='my-profile-avatar-settings-button'
        >
          {t.lobby.title.ava_settings}
        </Button>
      </div>
      <div className='justify-between flex-1 flexCol'>
        <div className='items-start gap-3 flexCol'>
          <div className='flex gap-3 items-center'>
            <Typography type='body1' className='text-white'>
              {me.nickname}
            </Typography>
            <div onClick={changeToEditMode} className='cursor-pointer'>
              <PFEdit />
            </div>
          </div>
          <Typography className='text-left text-white'>{me.introduction || '-'}</Typography>
        </div>

        <div className='flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center'>
          <div className='flex flex-wrap items-center gap-x-5 gap-y-2 sm:flex-1 sm:justify-between'>
            <Typography type='detail1' className='items-center gap-2 text-gray-200 flexRow'>
              {t.lobby.title.points}
              <Typography as='span' type='body3'>
                {`${Me.score(me, ActivityType.DJ_PNT)}p`}
              </Typography>
            </Typography>
            <Typography type='detail1' className='items-center gap-2 text-gray-200 flexRow'>
              {t.lobby.title.join_date}
              <Typography as='span' type='body3'>
                {Me.registrationDate(me)}
              </Typography>
            </Typography>
            {me.walletAddress && (
              <Link href={`https://rainbow.me/${me.walletAddress}`} target='_blank'>
                <Image
                  src={'/images/ETC/rainbow.png'}
                  alt='rainbow'
                  width={32}
                  height={32}
                  className='select-none pointer-events-none'
                />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default V2ViewMode;
