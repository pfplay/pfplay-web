import Image from 'next/image';
import { useMemo } from 'react';
import { Playlist, YoutubeMusic } from '@/shared/api/types/playlist';
import { IconMenu } from '@/shared/ui/components/icon-menu';
import { MenuItem } from '@/shared/ui/components/menu';
import { Typography } from '@/shared/ui/components/typography';
import { PFAddCircle, PFAddPlaylist } from '@/shared/ui/icons';

type SearchListItemProps = {
  music: YoutubeMusic;
  playlists?: Playlist[];
  onSelectPlaylist?: (id: number) => void;
  onAddPlaylist?: () => void;
};

const SearchListItem = ({
  music: { title, duration, thumbnailMedium },
  playlists = [],
  onSelectPlaylist,
  onAddPlaylist,
}: SearchListItemProps) => {
  const menuItemConfig: MenuItem[] = useMemo(
    () =>
      playlists.map(({ name: label, id }) => ({
        label,
        onClickItem: () => {
          onSelectPlaylist?.(id);
        },
      })),
    [playlists, onSelectPlaylist]
  );

  return (
    <div className='flex items-center gap-[32px]'>
      <div className='flex-1 flex items-center gap-[12px]'>
        <Image src={thumbnailMedium} alt={title} width={60} height={60} />
        <Typography className='flex-1 text-left mx-3'>{title}</Typography>
        <Typography>{formatDuration(duration)}</Typography>
      </div>

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

/**
 * Format duration to 'mm:ss'
 */
function formatDuration(duration: string) {
  const times = duration.match(/\d+/g);
  if (!times) return '00:00';

  const [minutes, seconds] = times.map((t) => parseInt(t, 10));
  const formattedMinutes = minutes.toString().padStart(2, '0');
  const formattedSeconds = seconds.toString().padStart(2, '0');

  return `${formattedMinutes}:${formattedSeconds}`;
}

export default SearchListItem;