'use client';

import { useState } from 'react';
import { useSuspenseFetchMe } from '@/entities/me';
import ProfileEditFormV2 from '@/features/edit-profile-bio/ui/v2.component';
import { extractScore, getRegistrationDate } from '@/features/view-crew-profile';
import ProfileCard from '@/features/view-crew-profile/ui/profile-card.component';
import { ActivityType } from '@/shared/api/http/types/@enums';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { Button } from '@/shared/ui/components/button';
import { PFEdit } from '@/shared/ui/icons';

type Props = {
  onClickAvatarSetting?: () => void;
};

export default function MyProfilePanel({ onClickAvatarSetting }: Props) {
  const t = useI18n();
  const { data: me } = useSuspenseFetchMe();

  const [mode, setMode] = useState<'view' | 'edit'>('view');

  return (
    <>
      {mode === 'view' && (
        <ProfileCard
          profile={{
            avatarBodyUri: me.avatarBodyUri,
            avatarFaceUri: me.avatarFaceUri,
            combinePositionX: me.combinePositionX,
            combinePositionY: me.combinePositionY,
            nickname: me.nickname,
            introduction: me.introduction || '',
            score: extractScore(me.activitySummaries, ActivityType.DJ_PNT),
            registrationDate: getRegistrationDate(me.registrationDate),
          }}
          actions={{
            avatar: (
              <Button size='sm' variant='outline' onClick={onClickAvatarSetting}>
                {t.lobby.title.ava_settings}
              </Button>
            ),
            info: (
              <div onClick={() => setMode('edit')} className='cursor-pointer'>
                <PFEdit />
              </div>
            ),
          }}
        />
      )}
      {mode === 'edit' && <ProfileEditFormV2 changeToViewMode={() => setMode('view')} />}
    </>
  );
}
