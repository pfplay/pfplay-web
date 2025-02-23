'use client';
import Image from 'next/image';
import { Avatar } from '@/entities/avatar';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { Button } from '@/shared/ui/components/button';
import { Typography } from '@/shared/ui/components/typography';
import { PFEdit } from '@/shared/ui/icons';

type Props = {
  onAvatarSettingClick?: () => void;
  changeToEditMode?: () => void;
  crew: {
    avatarBodyUri: string;
    avatarFaceUri: string;
    combinePositionX: number;
    combinePositionY: number;
    nickname: string;
    introduction: string;
    score: number;
    registrationDate: string;
  };
  viewMine?: boolean;
};

export default function Profile({
  crew,
  onAvatarSettingClick,
  changeToEditMode,
  viewMine = false,
}: Props) {
  const t = useI18n();

  return (
    <div className='gap-5 flexRow h-[284px]'>
      <div className='flexCol gap-9'>
        <div className='w-max min-w-[135px] h-[216px] flexRowCenter bg-[#1D1D1D] pointer-events-none select-none'>
          {!!crew.avatarBodyUri && (
            <Avatar
              height={180}
              bodyUri={crew.avatarBodyUri}
              faceUri={crew.avatarFaceUri}
              facePosX={crew.combinePositionX}
              facePosY={crew.combinePositionY}
            />
          )}
        </div>

        {viewMine && (
          <Button size='sm' variant='outline' onClick={onAvatarSettingClick}>
            {t.lobby.title.ava_settings}
          </Button>
        )}
      </div>
      <div className='justify-between flex-1 flexCol'>
        <div className='items-start gap-3 flexCol'>
          <div className='flex gap-3 items-center'>
            <Typography type='body1' className='text-white'>
              {crew.nickname}
            </Typography>
            {viewMine && (
              <div onClick={changeToEditMode} className='cursor-pointer'>
                <PFEdit />
              </div>
            )}
          </div>
          <Typography className='text-left text-white'>{crew.introduction || '-'}</Typography>
        </div>

        <div className='items-center justify-between flexRow'>
          <div className='gap-10 flexRow'>
            <Typography type='detail1' className='items-center gap-2 text-gray-200 flexRow'>
              {t.lobby.title.points}
              <Typography as='span' type='body3'>
                {/* {`${Me.score(crew, ActivityType.DJ_PNT)}p`} */}
                {`${crew.score}p`}
              </Typography>
            </Typography>
            <Typography type='detail1' className='items-center gap-2 text-gray-200 flexRow'>
              {t.lobby.title.join_date}
              <Typography as='span' type='body3'>
                {/* {Me.registrationDate(crew)} */}
                {crew.registrationDate}
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
