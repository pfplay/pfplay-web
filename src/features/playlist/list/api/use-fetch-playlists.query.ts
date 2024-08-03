'use client';
import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { QueryKeys } from '@/shared/api/http/query-keys';
import PlaylistsService from '@/shared/api/http/services/playlists';
import { PlaylistType } from '@/shared/api/http/types/@enums';
import { APIError } from '@/shared/api/http/types/@shared';
import { GetPlaylistsResponse, Playlist } from '@/shared/api/http/types/playlists';
import { FIVE_MINUTES, ONE_MINUTE } from '@/shared/config/time';
import { Dictionary, useI18n } from '@/shared/lib/localization/i18n.context';

export default function useFetchPlaylists() {
  const queryClient = useQueryClient();
  const t = useI18n();

  useEffect(() => {
    // 언어가 변경될 때마다 해당 언어에 맞춰 Grab Playlist의 이름을 다시 덮어씌움
    const cached = queryClient.getQueryData<GetPlaylistsResponse>([QueryKeys.Playlist]);

    if (cached) {
      queryClient.setQueryData<GetPlaylistsResponse>([QueryKeys.Playlist], {
        playlists: overwriteGrabPlaylistName(cached.playlists, t),
      });
    }
  }, [t]);

  return useQuery<GetPlaylistsResponse, AxiosError<APIError>, Playlist[]>({
    queryKey: [QueryKeys.Playlist],
    queryFn: () => PlaylistsService.getPlaylists(),
    select: ({ playlists }) => overwriteGrabPlaylistName(playlists, t),
    staleTime: ONE_MINUTE,
    gcTime: FIVE_MINUTES,
  });
}

function overwriteGrabPlaylistName(playlists: Playlist[], t: Dictionary) {
  return playlists.map((playlist) => {
    if (playlist.type === PlaylistType.GRABLIST) {
      return {
        ...playlist,
        name: t.playlist.title.grabbed_song,
      };
    }
    return playlist;
  });
}
