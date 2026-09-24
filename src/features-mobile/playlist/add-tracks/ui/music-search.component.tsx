'use client';

import { ChangeEvent, FC, ReactNode, useState } from 'react';
import { useSearchMusics } from '@/features/playlist/add-tracks';
import { Music } from '@/shared/api/http/types/playlists';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { Input } from '@/shared/ui/components/input';
import { TextButton } from '@/shared/ui/components/text-button';
import { Typography } from '@/shared/ui/components/typography';
import { PFSearch } from '@/shared/ui/icons';

interface Props {
  placeholder: string;
  inputTestId?: string;
  renderItem: (music: Music) => ReactNode;
}

/**
 * 모바일 음악 검색의 공통 검색·상태 컨테이너.
 * 검색 API와 loading/error/empty 상태만 담당하고 결과 행의 도메인별 UI는 주입받는다.
 */
const MusicSearch: FC<Props> = ({
  placeholder,
  inputTestId = 'music-search-input',
  renderItem,
}) => {
  const t = useI18n();
  const [query, setQuery] = useState('');
  const { data, isLoading, error, refetch } = useSearchMusics(query);
  const list: Music[] = data ?? [];

  return (
    <div className='flex flex-col h-full'>
      <div className='shrink-0 px-4 pb-3 pt-4'>
        <Input
          data-testid={inputTestId}
          value={query}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          Prefix={<PFSearch width={24} height={24} />}
          size='lg'
          classNames={{ container: 'h-[48px] rounded-lg px-3', input: 'text-[18px]' }}
        />
      </div>
      <div className='flex-1 overflow-y-auto px-4'>
        {error && (
          <div className='p-4 text-center'>
            <Typography type='body3' className='text-gray-400'>
              {t.partyroom.queue.sheet_search_failed}
            </Typography>
            <TextButton data-testid='music-search-retry' onClick={() => refetch?.()}>
              {t.system.maintenance.active.retry}
            </TextButton>
          </div>
        )}
        {!error && query.length > 0 && !isLoading && list.length === 0 && (
          <div className='p-4 text-center'>
            <Typography type='body3' className='text-gray-400'>
              {t.partyroom.queue.sheet_empty_search}
            </Typography>
          </div>
        )}
        {!error && list.length > 0 && <ul>{list.map(renderItem)}</ul>}
      </div>
    </div>
  );
};

export default MusicSearch;
