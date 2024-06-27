import Image from 'next/image';
import { useMemo } from 'react';
import { usePlaylistAction } from '@/entities/playlist';
import { MusicListItem } from '@/shared/api/types/playlists';
import { safeDecodeURI } from '@/shared/lib/functions/safe-decode-uri';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { IconMenu } from '@/shared/ui/components/icon-menu';
import { MenuItem } from '@/shared/ui/components/menu';
import { Typography } from '@/shared/ui/components/typography';
import { PFAddCircle, PFAddPlaylist } from '@/shared/ui/icons';

type SearchListItemProps = {
  music: MusicListItem;
  onSelectPlaylist?: (id: number) => void;
};

const SearchListItem = ({
  music: { videoTitle, runningTime, thumbnailUrl },
  onSelectPlaylist,
}: SearchListItemProps) => {
  const t = useI18n();
  const playlistAction = usePlaylistAction();

  const menuItemConfig: MenuItem[] = useMemo(
    () => [
      ...playlistAction.list.map(({ name: label, id }) => ({
        label,
        onClickItem: () => onSelectPlaylist?.(id),
      })),
      {
        label: t.playlist.btn.add_playlist,
        Icon: <PFAddCircle />,
        onClickItem: playlistAction.add,
      },
    ],
    [playlistAction.list, playlistAction.add, t, onSelectPlaylist]
  );

  return (
    <div className='flex items-center gap-[32px]'>
      <div className='flex-1 flex items-center gap-[12px]'>
        <Image src={thumbnailUrl} alt='Video Thumbnail' width={60} height={60} />
        {/* 일본어, 중국어 등의 정상 렌더링을 위해 url encode, title decode 해줘야 함 */}
        <Typography className='flex-1 text-left mx-3'>{safeDecodeURI(videoTitle)}</Typography>
        <Typography>{formatDuration(runningTime)}</Typography>
      </div>

      <IconMenu
        MenuButtonIcon={<PFAddPlaylist />}
        menuItemPanel={{ className: 'm-w-[300px] border border-gray-500' }}
        menuItemConfig={menuItemConfig}
      />
    </div>
  );
};

/**
 * Format duration to 'mm:ss'
 */
function formatDuration(duration: string) {
  const times = duration?.match(/\d+/g);
  if (!times) return '00:00';

  const [minutes, seconds] = times.map((t) => parseInt(t, 10));
  const formattedMinutes = minutes.toString().padStart(2, '0');
  const formattedSeconds = seconds.toString().padStart(2, '0');

  return `${formattedMinutes}:${formattedSeconds}`;
}

export default SearchListItem;
