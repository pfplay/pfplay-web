'use client';
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { QueryKeys } from '@/shared/api/http/query-keys';
import PlaylistsService from '@/shared/api/http/services/playlists';
import { APIError } from '@/shared/api/http/types/@shared';
import { GetPlaylistsResponse, Playlist } from '@/shared/api/http/types/playlists';
import { FIVE_MINUTES, ONE_MINUTE } from '@/shared/config/time';
import { Language } from '@/shared/lib/localization/constants';
import { useLang } from '@/shared/lib/localization/lang.context';

export const useFetchPlaylists = () => {
  const lang = useLang();

  return useQuery<GetPlaylistsResponse, AxiosError<APIError>, Playlist[]>({
    queryKey: [QueryKeys.Playlist],
    queryFn: () => PlaylistsService.getPlaylists(),
    /**
     * FIXME
     * https://pfplay.slack.com/archives/C051N8A0ZSB/p1719775341481399
     * 번역을 FE에서 주관하고 있어서 백엔드에서 생성하는 그랩 플레이리스트명을 번역할 방법이 아직 없음.. 일단 나쁜 짓으로 처리.
     * 방안 논의 필요
     */
    select: ({ playlists }) => {
      return playlists.map((playlist) => {
        if (playlist.name === '그랩한 곡' && lang === Language.En) {
          return {
            ...playlist,
            name: 'Grabbed song',
          };
        }
        return playlist;
      });
    },
    staleTime: ONE_MINUTE,
    gcTime: FIVE_MINUTES,
  });
};
