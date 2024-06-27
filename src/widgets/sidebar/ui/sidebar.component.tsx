'use client';
import Image from 'next/image';
import { ProfileEditFormV2 } from '@/features/edit-profile-bio';
import { useDisclosure } from '@/shared/lib/hooks/use-disclosure.hook';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useDialog } from '@/shared/ui/components/dialog';
import { Typography } from '@/shared/ui/components/typography';
import { PFDj, PFHeadset } from '@/shared/ui/icons';
import PlaylistActionProvider from 'widgets/sidebar/lib/playlist-action.provider';
import MyPlaylist from './my-playlist.component';

interface SidebarProps {
  className: string;
  showDJQueue?: boolean;
}

const Sidebar = ({ className, showDJQueue }: SidebarProps) => {
  const t = useI18n();
  const { openDialog } = useDialog();
  const { open: showPlaylist, onClose: hidePlaylist, onToggle: togglePlaylist } = useDisclosure();

  const handleClickProfileButton = () => {
    return openDialog((_, onCancel) => ({
      title: t.common.btn.my_profile,
      titleAlign: 'left',
      titleType: 'title2',
      showCloseIcon: true,
      classNames: {
        container: 'min-w-[620px] py-7 px-10 bg-black',
      },
      Body: <ProfileEditFormV2 onClickAvatarSetting={onCancel} />,
    }));
  };

  return (
    <>
      <aside className={className}>
        {/* TODO: 프로필 이미지로 변경, href 추가 */}
        <button onClick={handleClickProfileButton} className='gap-2 cursor-pointer flexColCenter'>
          <Image
            src='/images/Background/profile.png' // TODO: user session에서 프로필 받아와 변경
            alt='profile' // TODO: user session에서 프로필 받아와 변경
            width={48}
            height={48}
            className='rounded-[100%] border-gray-500 border border-solid w-[48px] h-[48px]'
          />
          <Typography type='caption1' className='text-gray-200'>
            {t.common.btn.my_profile}
          </Typography>
        </button>
        <button onClick={togglePlaylist} className='flexColCenter gap-2 cursor-pointer'>
          <PFHeadset width={36} height={36} className='[&_*]:fill-gray-400' />
          <Typography type='caption1' className='text-gray-200'>
            {t.common.btn.playlist}
          </Typography>
        </button>

        {showDJQueue && (
          <button
            onClick={() => {
              alert('Not Impl');
            }}
            className='flexColCenter gap-2 cursor-pointer'
          >
            <PFDj width={36} height={36} className='[&_*]:fill-gray-400' />
            <Typography type='caption1' className='text-gray-200'>
              {t.dj.title.dj_queue}
            </Typography>
          </button>
        )}
      </aside>

      <PlaylistActionProvider>
        <MyPlaylist isDrawerOpen={showPlaylist} closeDrawer={hidePlaylist} />
      </PlaylistActionProvider>
    </>
  );
};

export default Sidebar;
