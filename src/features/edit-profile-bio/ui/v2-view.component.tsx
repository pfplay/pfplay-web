'use client';

import { useSuspenseFetchMe } from '@/entities/me';
import { Profile } from '@/entities/profile';
import { ActivityType } from '@/shared/api/http/types/@enums';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { Button } from '@/shared/ui/components/button';
import { ProfileCard } from '@/shared/ui/components/profile-card';
import { PFEdit } from '@/shared/ui/icons';

type V2ViewModeProps = {
  onAvatarSettingClick?: () => void;
  changeToEditMode: () => void;
};

const V2ViewMode = ({ onAvatarSettingClick, changeToEditMode }: V2ViewModeProps) => {
  const { data: me } = useSuspenseFetchMe();
  const t = useI18n();

  return (
    <ProfileCard
      profile={{
        avatarBodyUri: me.avatarBodyUri,
        avatarFaceUri: me.avatarFaceUri,
        combinePositionX: me.combinePositionX,
        combinePositionY: me.combinePositionY,
        nickname: me.nickname,
        introduction: me.introduction || '',
        score: Profile.score(me.activitySummaries, ActivityType.DJ_PNT),
        registrationDate: Profile.registrationDate(me.registrationDate),
      }}
      actions={{
        avatar: (
          <Button size='sm' variant='outline' onClick={onAvatarSettingClick}>
            {t.lobby.title.ava_settings}
          </Button>
        ),
        info: (
          <div onClick={changeToEditMode} className='cursor-pointer'>
            <PFEdit />
          </div>
        ),
      }}
    />
  );
};

export default V2ViewMode;
