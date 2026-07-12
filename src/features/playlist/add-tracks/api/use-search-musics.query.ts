import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { QueryKeys } from '@/shared/api/http/query-keys';
import { playlistsService } from '@/shared/api/http/services';
import { APIError } from '@/shared/api/http/types/@shared';
import { Music, SearchMusicsResponse } from '@/shared/api/http/types/playlists';
import { FIVE_MINUTES } from '@/shared/config/time';
import { normalizeYoutubeSearchInput } from '../lib/normalize-youtube-search';

export const useSearchMusics = (search: string) => {
  // 유튜브 URL 붙여넣기는 canonical watch URL로 정규화(youtu.be·list·index 대응).
  // 일반 검색어는 원본 유지. 데스크톱/모바일 공통 진입점이라 여기서 한 번에 처리한다.
  const q = normalizeYoutubeSearchInput(search);

  return useQuery<SearchMusicsResponse, AxiosError<APIError>, Music[]>({
    queryKey: [QueryKeys.Musics, q],
    queryFn: () =>
      playlistsService.searchMusics({
        q,
        platform: 'youtube',
      }),
    select: (data) => data.musicList,
    enabled: !!q,
    staleTime: 0,
    gcTime: FIVE_MINUTES,
  });
};
