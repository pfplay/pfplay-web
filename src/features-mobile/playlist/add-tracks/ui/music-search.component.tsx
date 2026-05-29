'use client';
import { ChangeEvent, FC, useState } from 'react';
import { useSearchMusics } from '@/features/playlist/add-tracks';
import { Music } from '@/shared/api/http/types/playlists';
import { Input } from '@/shared/ui/components/input';
import { TextButton } from '@/shared/ui/components/text-button';
import { Typography } from '@/shared/ui/components/typography';
import SearchListItem from './search-list-item.component';

interface Props {
  onPreview: (music: Music) => void;
  onAdd: (music: Music) => void;
  addPending: boolean;
}

/**
 * 모바일 트랙 추가 시트의 검색 영역.
 *
 * - Input 으로 query 입력 → `useSearchMusics(query)` 호출 (공유 react-query)
 * - `select: (data) => data.musicList` 가 이미 unwrap → `data` 는 `Music[]`
 * - empty / error(retry) / 결과 리스트 3분기, 각 곡 → SearchListItem
 */
const MusicSearch: FC<Props> = ({ onPreview, onAdd, addPending }) => {
  const [query, setQuery] = useState('');
  const { data, isLoading, error, refetch } = useSearchMusics(query);
  const list: Music[] = data ?? [];

  return (
    <div className='flex flex-col h-full'>
      <div className='shrink-0 px-4 py-3 border-b border-gray-800'>
        <Input
          data-testid='music-search-input'
          value={query}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
          placeholder='곡명 또는 아티스트로 검색'
          aria-label='곡 검색'
        />
      </div>
      <div className='flex-1 overflow-y-auto'>
        {error && (
          <div className='p-4 text-center'>
            <Typography type='body3' className='text-gray-400'>
              검색에 실패했어요
            </Typography>
            <TextButton data-testid='music-search-retry' onClick={() => refetch?.()}>
              다시 시도
            </TextButton>
          </div>
        )}
        {!error && query.length > 0 && !isLoading && list.length === 0 && (
          <div className='p-4 text-center'>
            <Typography type='body3' className='text-gray-400'>
              다른 키워드로 시도해보세요
            </Typography>
          </div>
        )}
        {!error && list.length > 0 && (
          <ul>
            {list.map((music) => (
              <SearchListItem
                key={music.videoId}
                music={music}
                onPreview={onPreview}
                onAdd={onAdd}
                addPending={addPending}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MusicSearch;
