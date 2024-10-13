'use client';

import Image from 'next/image';
import { Avatar } from '@/entities/avatar';
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
    <div className='gap-5 flexRow'>
      <div className='flexCol gap-9'>
        <div className='w-max h-[216px] flexRowCenter bg-[#1D1D1D] pointer-events-none select-none'>
          {!!me.avatarBodyUri && (
            <Avatar
              height={180}
              bodyUri={me.avatarBodyUri}
              faceUri={me.avatarFaceUri}
              facePosX={me.combinePositionX}
              facePosY={me.combinePositionY}
            />
          )}
        </div>

        <Button size='sm' variant='outline' onClick={onAvatarSettingClick}>
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

        <div className='items-center justify-between flexRow'>
          <div className='gap-10 flexRow'>
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
