import Image from 'next/image';
import { useMemo } from 'react';
import { Playlist, YoutubeMusic } from '@/api/@types/Playlist';
import IconMenu from '@/components/shared/IconMenu';
import { MenuItem } from '@/components/shared/atoms/Menu/MenuItemPanel';
import Typography from '@/components/shared/atoms/Typography';
import { PFAddPlaylist } from '@/components/shared/icons';

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
      <Typography className='flex-1'>{title}</Typography>
      <Typography>{duration}</Typography>

      <IconMenu
        MenuButtonIcon={<PFAddPlaylist />}
        menuItemPanel={{ size: 'sm' }}
        menuItemConfig={[
          ...menuItemConfig,
          {
            label: '플레이리스트추가',
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
