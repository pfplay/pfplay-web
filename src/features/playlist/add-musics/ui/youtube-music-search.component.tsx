import { ReactNode, useCallback, useState } from 'react';
import { usePlaylistAction } from '@/entities/playlist';
import { YoutubeMusic } from '@/shared/api/types/playlists';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { InfiniteScroll } from '@/shared/ui/components/infinite-scroll';
import { Typography } from '@/shared/ui/components/typography';
import SearchInput from './search-input.component';
import SearchListItem from './search-list-item.component';
import { useInfiniteFetchYoutubeMusics } from '../api/use-infinite-fetch-youtube-musics.query';

type YoutubeMusicSearchProps = {
  extraAction?: ReactNode;
};
const YoutubeMusicSearch = ({ extraAction }: YoutubeMusicSearchProps) => {
  const t = useI18n();
  const [search, setSearch] = useState('');
  const {
    data: youtubeMusics,
    fetchNextPage: fetchNextYoutubeMusicsPage,
    isFetchedAfterMount: isFetchedYoutubeMusicsAfterMount,
    hasNextPage: hasNextYoutubeMusicsPage,
  } = useInfiniteFetchYoutubeMusics(search);
  const playlistAction = usePlaylistAction();

  const handleSelectPlaylist = useCallback(
    (listId: number, music: YoutubeMusic) => {
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
        {!!search && (
          <InfiniteScroll
            loadMore={fetchNextYoutubeMusicsPage}
            hasMore={
              hasNextYoutubeMusicsPage ||
              /**
               * enabled가 false일 때는 hasNextPage 또한 항상 false이기에, 이 땐 hasMore를 true로 취급합니다.
               * `!!search`대신 isFetchedAfterMount를 사용하는 이유는, search가 truthy가 되어도 react-query 훅이 반응하기 전 일순간은 hasNextPage가 아직 false이기에,
               * endMessage가 한순간 보이는걸 방지하기 위해서입니다.
               */
              !isFetchedYoutubeMusicsAfterMount
            }
            observedHeight={120}
          >
            {youtubeMusics?.map((music) => (
              <div key={music.videoId} className='py-3'>
                <SearchListItem
                  music={music}
                  onSelectPlaylist={(listId) => handleSelectPlaylist(listId, music)}
                />
              </div>
            ))}
          </InfiniteScroll>
        )}
      </div>
    </div>
  );
};

export default YoutubeMusicSearch;
