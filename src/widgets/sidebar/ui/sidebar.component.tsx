'use client';
import { ReactNode } from 'react';
import { useSuspenseFetchMe } from '@/entities/me';
import { ProfileEditFormV2 } from '@/features/edit-profile-bio';
import { mergeDeep } from '@/shared/lib/functions/merge-deep';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useStores } from '@/shared/lib/store/stores.context';
import { useDialog } from '@/shared/ui/components/dialog';
import Profile from '@/shared/ui/components/profile/profile.component';
import { Typography } from '@/shared/ui/components/typography';
import { PFHeadset } from '@/shared/ui/icons';

interface SidebarProps {
  className: string;
  extraButton?: {
    onClick: () => void;
    icon: (size: number, className: string) => ReactNode;
    text: string;
  };
}

const Sidebar = ({ className, extraButton }: SidebarProps) => {
  const t = useI18n();
  const { data: me } = useSuspenseFetchMe();
  const { openDialog } = useDialog();
  const { useUIState } = useStores();
  const setPlaylistDrawer = useUIState((state) => state.setPlaylistDrawer);

  const togglePlaylist = () => {
    setPlaylistDrawer((prev) => mergeDeep(prev, { open: !prev.open }));
  };

  const handleClickProfileButton = () => {
    return openDialog((_, onCancel) => ({
      title: t.common.btn.my_profile,
      titleAlign: 'left',
      titleType: 'title2',
      showCloseIcon: true,
      classNames: {
        container: 'w-[620px] h-[391px] py-7 px-10 bg-black',
      },
      Body: <ProfileEditFormV2 onClickAvatarSetting={onCancel} />,
    }));
  };

  return (
    <aside className={className}>
      {/* TODO: 프로필 이미지로 변경, href 추가 */}
      <button onClick={handleClickProfileButton} className='gap-2 cursor-pointer flexColCenter'>
        <Profile size={48} src={me.avatarFaceUri} />
        <Typography type='caption1' className='text-gray-200'>
          {t.common.btn.my_profile}
        </Typography>
      </button>
      <button onClick={togglePlaylist} className='gap-2 cursor-pointer flexColCenter'>
        <PFHeadset width={36} height={36} className='[&_*]:fill-gray-400' />
        <Typography type='caption1' className='text-gray-200'>
          {t.common.btn.playlist}
        </Typography>
      </button>

      {extraButton && (
        <button onClick={extraButton.onClick} className='gap-2 cursor-pointer flexColCenter'>
          {extraButton.icon(36, 'text-gray-400')}
          <Typography type='caption1' className='text-gray-200'>
            {extraButton.text}
          </Typography>
        </button>
      )}
    </aside>
  );
};

export default Sidebar;
