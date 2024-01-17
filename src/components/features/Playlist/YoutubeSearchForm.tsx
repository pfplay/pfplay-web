import React, { useState } from 'react';
import { YoutubeMusic } from '@/api/@types/Playlist';
import { useAddPlaylistMusicMutation } from '@/api/query-temp/playlist/useAddPlaylistMusicMutation';
import { usePlaylistQuery } from '@/api/query-temp/playlist/usePlaylistQuery';
import useYoutubeInfiniteQuery from '@/api/query-temp/playlist/useYoutubeInfiniteQuery';
import Typography from '@/components/shared/atoms/Typography';
import { PFClose } from '@/components/shared/icons';
import { useDialog } from '@/hooks/useDialog';
import PlaylistCreateForm from './PlaylistCreateForm';
import YoutubeSearchInput from './YoutubeSearchInput';
import YoutubeSearchItem from './YoutubeSearchItem';

type YoutubeSearchFormProps = {
  onClose?: () => void;
};
const YoutubeSearchForm = ({ onClose }: YoutubeSearchFormProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: youtubeMusics, setRef } = useYoutubeInfiniteQuery(searchQuery);
  const { data: playlist } = usePlaylistQuery();
  const { mutate: addMusicToPlaylist } = useAddPlaylistMusicMutation();
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
      <div className='flex items-center'>
        <Typography>곡추가</Typography>
        <YoutubeSearchInput onSearch={setSearchQuery} />
        <button onClick={onClose}>
          <PFClose width={24} height={24} />
        </button>
      </div>

      <div className='h-[200px] overflow-scroll'>
        {pages.map((page) => {
          return page.musicList.map((music) => (
            <YoutubeSearchItem
              key={music.id}
              music={music}
              playlist={playlist}
              onAddPlaylist={handleAddPlaylist}
              onSelectPlaylist={(listId) => handleSelectPlaylist(listId, music)}
            />
          ));
        })}

        <div ref={setRef}>여기야~</div>
      </div>
    </div>
  );
};

export default YoutubeSearchForm;
