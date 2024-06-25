import { ReactNode, useCallback, useState } from 'react';
import { usePlaylistAction } from '@/entities/playlist';
import { MusicListItem } from '@/shared/api/types/playlists';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import LoadingPanel from '@/shared/ui/components/loading/loading-panel.component';
import { Typography } from '@/shared/ui/components/typography';
import { useSearchMusics } from 'features/playlist/add-musics/api/use-search-musics.query';
import SearchInput from './search-input.component';
import SearchListItem from './search-list-item.component';

type MusicSearchProps = {
  extraAction?: ReactNode;
};
const MusicSearch = ({ extraAction }: MusicSearchProps) => {
  const t = useI18n();
  const [search, setSearch] = useState('');
  const { data: musics, isFetching } = useSearchMusics(search);
  const playlistAction = usePlaylistAction();

  const handleSelectPlaylist = useCallback(
    (listId: number, music: MusicListItem) => {
      playlistAction.addMusic(listId, {
        linkId: music.videoId,
        thumbnailImage: music.thumbnailUrl,
        duration: music.runningTime,
        name: music.videoTitle,
      });
    },
    [playlistAction]
  );

  return (
    <div className='pt-[36px] pb-[12px] pl-[40px] pr-[12px]'>
      <div className='flex items-center gap-7 mb-11 pr-[28px]'>
        <Typography type='title2'>{t.playlist.btn.add_song}</Typography>
        <SearchInput onSearch={setSearch} />
        {extraAction}
      </div>

      <div className='h-[340px] overflow-y-scroll pr-[8px]'>
        {isFetching && <LoadingPanel />}
        {!isFetching &&
          !!search &&
          musics?.map((music) => (
            <div key={music.videoId} className='py-3'>
              <SearchListItem
                music={music}
                onSelectPlaylist={(listId) => handleSelectPlaylist(listId, music)}
              />
            </div>
          ))}
      </div>
    </div>
  );
};

export default MusicSearch;
