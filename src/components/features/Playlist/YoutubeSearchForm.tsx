import React, { useState } from 'react';
import useYoutubeInfiniteQuery from '@/api/query-temp/playlist/useYoutubeInfiniteQuery';
import Typography from '@/components/shared/atoms/Typography';
import { PFClose } from '@/components/shared/icons';
import YoutubeSearchInput from './YoutubeSearchInput';
import YoutubeSearchItem from './YoutubeSearchItem';

type YoutubeSearchFormProps = {
  onClose?: () => void;
};
const YoutubeSearchForm = ({ onClose }: YoutubeSearchFormProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { data, setRef } = useYoutubeInfiniteQuery(searchQuery);

  const pages = data?.pages || [];
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
          return page.musicList.map((music) => <YoutubeSearchItem key={music.id} source={music} />);
        })}

        <div ref={setRef}>여기야~</div>
      </div>
    </div>
  );
};

export default YoutubeSearchForm;
