import Image from 'next/image';
import { useMemo } from 'react';
import { Playlist, YoutubeMusic } from '@/shared/api/types/playlist';
import IconMenu from '@/shared/ui/components/icon-menu/icon-menu.component';
import { MenuItem } from '@/shared/ui/components/menu/menu-item-panel.component';
import Typography from '@/shared/ui/components/typography/typography.component';
import { PFAddCircle, PFAddPlaylist } from '@/shared/ui/icons';

type YoutubeSearchCardProps = {
  music: YoutubeMusic;
  playlist?: Playlist[];
  onSelectPlaylist?: (id: number) => void;
  onAddPlaylist?: () => void;
};

const YoutubeSearchItem = ({
  music: { title, duration, thumbnailMedium },
  playlist = [],
  onSelectPlaylist,
  onAddPlaylist,
}: YoutubeSearchCardProps) => {
  const menuItemConfig: MenuItem[] = useMemo(
    () =>
      playlist.map(({ name: label, id }) => ({
        label,
        onClickItem: () => {
          onSelectPlaylist?.(id);
        },
      })),
    [playlist, onSelectPlaylist]
  );

  return (
    <div className='flex items-center'>
      <Image src={thumbnailMedium} alt={title} width={60} height={60} />
      <Typography className='flex-1 text-left mx-3'>{title}</Typography>
      <Typography>{duration}</Typography>

      <IconMenu
        MenuButtonIcon={<PFAddPlaylist />}
        menuItemPanel={{ className: 'm-w-[300px] border border-gray-500' }}
        menuItemConfig={[
          ...menuItemConfig,
          {
            label: '플레이리스트 추가',
            Icon: <PFAddCircle />,
            onClickItem: () => {
              onAddPlaylist?.();
            },
          },
        ]}
      />
    </div>
  );
};

export default YoutubeSearchItem;
