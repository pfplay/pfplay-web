import { useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QueryKeys } from '@/shared/api/http/query-keys';
import { PlaylistsService } from '@/shared/api/http/services/playlists';
import { AddPlaylistMusicRequestBody } from '@/shared/api/http/types/playlists';

export const useAddPlaylistMusic = () => {
  const queryClient = useQueryClient();
  const currListId = useRef<number>();

  return useMutation({
    mutationFn: ({ listId, ...params }: AddPlaylistMusicRequestBody & { listId: number }) => {
      currListId.current = listId;
      return PlaylistsService.addMusicToPlaylist(listId, params);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.PlaylistMusics, currListId.current],
      });
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.Playlist], // for refetch count
      });
    },
  });
};
