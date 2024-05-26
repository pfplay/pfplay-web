import { ReactNode, useState } from 'react';
import PlaylistCreateForm from '@/features/playlist/add/ui/form.component';
import { useFetchPlaylists } from '@/features/playlist/list/api/use-fetch-playlist.query';
import { YoutubeMusic } from '@/shared/api/types/playlist';
import { useDialog } from '@/shared/ui/components/dialog';
import { InfiniteScroll } from '@/shared/ui/components/infinite-scroll';
import { Typography } from '@/shared/ui/components/typography';
import SearchInput from './search-input.component';
import SearchListItem from './search-list-item.component';
import { useAddPlaylistMusic } from '../api/use-add-playlist-music.mutation';
import { useInfiniteFetchYoutubeMusics } from '../api/use-infinite-fetch-youtube-musics.query';

type YoutubeMusicSearchProps = {
  extraAction?: ReactNode;
};
const YoutubeMusicSearch = ({ extraAction }: YoutubeMusicSearchProps) => {
  const [search, setSearch] = useState('');
  const {
    data: youtubeMusics,
    fetchNextPage: fetchNextYoutubeMusicsPage,
    isFetchedAfterMount: isFetchedYoutubeMusicsAfterMount,
    hasNextPage: hasNextYoutubeMusicsPage,
  } = useInfiniteFetchYoutubeMusics(search);
  const { data: playlists } = useFetchPlaylists();
  const { mutate: addMusicToPlaylist } = useAddPlaylistMusic();
  const { openDialog } = useDialog();

  const handleChangeSearch = (search: string) => {
    setSearch(search);
  };
  const handleAddPlaylist = () => {
    openDialog((_, onCancel) => ({
      title: '플레이리스트 이름을 입력해주세요',
      Body: <PlaylistCreateForm onCancel={onCancel} />,
    }));
  };
  const handleSelectPlaylist = (listId: number, music: YoutubeMusic) => {
    addMusicToPlaylist({
      listId,
      uid: music.id,
      thumbnailImage: music.thumbnailMedium,
      duration: music.duration,
      name: music.title,
    });
  };

  return (
    <div className='pt-[36px] pb-[12px] pl-[40px] pr-[12px]'>
      <div className='flex items-center gap-7 mb-11 pr-[28px]'>
        <Typography type='title2'>곡 추가</Typography>
        <SearchInput onSearch={handleChangeSearch} />
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
              <div key={music.id} className='py-3'>
                <SearchListItem
                  music={music}
                  playlists={playlists}
                  onAddPlaylist={handleAddPlaylist}
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
