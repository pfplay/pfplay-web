import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { QueryKeys } from '@/shared/api/http/query-keys';
import PlaylistsService from '@/shared/api/http/services/playlists';
import { APIError, PaginationResponse } from '@/shared/api/http/types/@shared';
import { type PlaylistMusic } from '@/shared/api/http/types/playlists';
import { FIVE_MINUTES } from '@/shared/config/time';

export const useFetchPlaylistMusics = (listId: number) => {
  return useQuery<PaginationResponse<PlaylistMusic>, AxiosError<APIError>>({
    queryKey: [QueryKeys.PlaylistMusics, listId],
    queryFn: () =>
      /**
       * TODO: 페이지네이션 무시하고 music 최대 개수 일괄 조회 중. 추후 개선할 것. 100개라 페이지네이션 자체가 필요 없을 수도?
       */
      PlaylistsService.getMusicsFromPlaylist(listId, {
        pageNumber: 0,
        pageSize: MUSICS_COUNT_LIMIT_PER_1_PLAYLIST,
      }),
    staleTime: 0,
    gcTime: FIVE_MINUTES,
  });
};

/**
 * @see https://www.figma.com/design/9I5PR6OqN8cHJ7WVTOKe00/PFPlay-GUI-%EC%84%A4%EA%B3%84%EC%84%9C-%ED%95%A9%EB%B3%B8?node-id=824-14018&t=pxcu7ZeI66HYJK3s-4
 */
const MUSICS_COUNT_LIMIT_PER_1_PLAYLIST = 100;
