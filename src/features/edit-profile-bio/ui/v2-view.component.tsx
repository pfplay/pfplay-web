'use client';

import { Me, useSuspenseFetchMe } from '@/entities/me';
import { Profile } from '@/entities/profile';
import { ActivityType } from '@/shared/api/http/types/@enums';

type V2ViewModeProps = {
  onAvatarSettingClick?: () => void;
  changeToEditMode: () => void;
};

const V2ViewMode = ({ onAvatarSettingClick, changeToEditMode }: V2ViewModeProps) => {
  const { data: me } = useSuspenseFetchMe();

  return (
    <Profile
      crew={{
        avatarBodyUri: me.avatarBodyUri,
        avatarFaceUri: me.avatarFaceUri,
        combinePositionX: me.combinePositionX,
        combinePositionY: me.combinePositionY,
        nickname: me.nickname,
        introduction: me.introduction || '',
        score: Me.score(me, ActivityType.DJ_PNT),
        registrationDate: Me.registrationDate(me),
      }}
      onAvatarSettingClick={onAvatarSettingClick}
      changeToEditMode={changeToEditMode}
      viewMine
    />
  );
};

export default V2ViewMode;
