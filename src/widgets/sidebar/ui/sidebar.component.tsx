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

type SidebarProps = {
  className: string;
  onClickAvatarSetting: () => void;
  extraButton?: {
    onClick: () => void;
    icon: (size: number, className: string) => ReactNode;
    text: string;
  };
};

export default function Sidebar({ className, onClickAvatarSetting, extraButton }: SidebarProps) {
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
      title: ({ defaultClassName }) => (
        <Typography type='title2' className={defaultClassName}>
          {t.common.btn.my_profile}
        </Typography>
      ),
      titleAlign: 'left',
      showCloseIcon: true,
      classNames: {
        container: 'w-[620px] h-[391px] py-7 px-10 bg-black',
      },
      Body: (
        <ProfileEditFormV2
          onClickAvatarSetting={() => {
            onClickAvatarSetting();
            onCancel?.();
          }}
        />
      ),
    }));
  };

  return (
    <aside className={className}>
      <button onClick={handleClickProfileButton} className='gap-2 cursor-pointer flexColCenter'>
        <Profile size={48} src={me.avatarIconUri} />
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
}
