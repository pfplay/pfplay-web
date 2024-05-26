import React, { useState } from 'react';
import { useAddPlaylistMusic } from '@/api/react-query/playlist/use-add-playlist-music.mutation';
import { useFetchPlaylist } from '@/api/react-query/playlist/use-fetch-playlist.query';
import { useInfiniteFetchYoutube } from '@/api/react-query/playlist/use-infinite-fetch-youtube.query';
import { YoutubeMusic } from '@/shared/api/types/playlist';
import { useDialog } from '@/shared/ui/components/dialog';
import { Typography } from '@/shared/ui/components/typography';
import { PFClose } from '@/shared/ui/icons';
import PlaylistCreateForm from './playlist-create-form.component';
import YoutubeSearchInput from './youtube-search-input.component';
import YoutubeSearchItem from './youtube-search-item.component';

type YoutubeSearchProps = {
  onClose?: () => void;
};
const YoutubeSearch = ({ onClose }: YoutubeSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const {
    data: youtubeMusics,
    setRef,
    isLoading,
    isFetching,
  } = useInfiniteFetchYoutube(searchQuery);
  const { data: playlist } = useFetchPlaylist();
  const { mutate: addMusicToPlaylist } = useAddPlaylistMusic();
  const { openDialog } = useDialog();

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

  const pages = youtubeMusics?.pages || [];

  return (
    <div>
      <div className='flex items-center gap-7 mb-11'>
        <Typography type='title2'>곡추가</Typography>
        <YoutubeSearchInput onSearch={setSearchQuery} />
        <button onClick={onClose}>
          <PFClose width={24} height={24} />
        </button>
      </div>

      <div className='h-[340px] overflow-y-auto'>
        {pages.map((page) => {
          return page.musicList.map((music) => (
            <div key={music.id} className='py-3'>
              <YoutubeSearchItem
                music={music}
                playlist={playlist}
                onAddPlaylist={handleAddPlaylist}
                onSelectPlaylist={(listId) => handleSelectPlaylist(listId, music)}
              />
            </div>
          ));
        })}

        {/* TODO: 무한 스크롤 로딩처리 */}
        {!isLoading && isFetching && <div className='h-5'>음악을 불러오는 중입니다...</div>}

        <div ref={setRef} className='h-3' />
      </div>
    </div>
  );
};

export default YoutubeSearch;
