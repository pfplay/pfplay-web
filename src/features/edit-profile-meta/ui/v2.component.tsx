'use client';

import { useState } from 'react';
import V2EditMode from './v2-edit.component';
import V2ViewMode from './v2-view.component';

type ProfileEditFormV2Props = {
  onClickAvatarSetting?: () => void;
};

const ProfileEditFormV2 = ({ onClickAvatarSetting }: ProfileEditFormV2Props) => {
  const [mode, setMode] = useState<'view' | 'edit'>('view');

  return (
    <>
      {mode === 'view' && (
        <V2ViewMode
          onAvatarSettingClick={onClickAvatarSetting}
          changeToEditMode={() => setMode('edit')}
        />
      )}
      {mode === 'edit' && <V2EditMode changeToViewMode={() => setMode('view')} />}
    </>
  );
};

export default ProfileEditFormV2;
