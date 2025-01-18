import { ReactNode, useCallback } from 'react';
import { PlaylistActionContext } from '@/entities/playlist';
import { PlaylistActionOptions } from '@/entities/playlist/lib/playlist-action.context';
import { useAddPlaylistDialog } from '@/features/playlist/add';
import { useAddPlaylistTrack } from '@/features/playlist/add-tracks';
import { useEditPlaylistDialog } from '@/features/playlist/edit';
import { useFetchPlaylists } from '@/features/playlist/list';
import { useMovePlaylistTrack } from '@/features/playlist/move-track-to-the-other-playlist';
import { useRemovePlaylist } from '@/features/playlist/remove';
import { useRemovePlaylistTrack } from '@/features/playlist/remove-track';
import {
  AddTrackToPlaylistRequestBody,
  MoveTrackInPlaylistRequest,
  Playlist,
} from '@/shared/api/http/types/playlists';

export default function PlaylistActionProvider({ children }: { children: ReactNode }) {
  const { data: list = [] } = useFetchPlaylists();
  const add = useAddPlaylistDialog();
  const edit = useEditPlaylistDialog(list);
  const { mutate: _remove } = useRemovePlaylist();

  const { mutate: _addTrack } = useAddPlaylistTrack();
  const { mutate: _removeTrack } = useRemovePlaylistTrack();
  const { mutateAsync: _moveTrack } = useMovePlaylistTrack();

  const remove = useCallback(
    (targetIds: Playlist['id'][], options?: PlaylistActionOptions) => {
      _remove(targetIds, {
        onSuccess: options?.onSuccess,
      });
    },
    [_remove]
  );

  const addTrack = useCallback(
    (targetId: Playlist['id'], track: AddTrackToPlaylistRequestBody) => {
      _addTrack({
        listId: targetId,
        ...track,
      });
    },
    [_addTrack]
  );

  const removeTrack = useCallback(
    (targetId: Playlist['id'], trackId: number) => {
      _removeTrack({
        playlistId: targetId,
        trackId,
      });
    },
    [_removeTrack]
  );

  const moveTrack = useCallback(
    async (params: MoveTrackInPlaylistRequest) => {
      await _moveTrack(params);
    },
    [_moveTrack]
  );

  return (
    <PlaylistActionContext.Provider
      value={{
        list,
        add,
        edit,
        remove,
        moveTrack,
        addTrack,
        removeTrack,
      }}
    >
      {children}
    </PlaylistActionContext.Provider>
  );
}
