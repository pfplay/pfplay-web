import { ReactNode, useCallback } from 'react';
import { PlaylistActionContext } from '@/entities/playlist';
import { PlaylistActionOptions } from '@/entities/playlist/lib/playlist-action.context';
import { useAddPlaylistDialog } from '@/features/playlist/add';
import { useAddPlaylistMusic } from '@/features/playlist/add-musics';
import { useEditPlaylistDialog } from '@/features/playlist/edit';
import { useFetchPlaylists } from '@/features/playlist/list';
import { useRemovePlaylist } from '@/features/playlist/remove';
import { useRemovePlaylistMusics } from '@/features/playlist/remove-musics';
import { AddPlaylistMusicRequestBody, Playlist } from '@/shared/api/http/types/playlists';

export default function PlaylistActionProvider({ children }: { children: ReactNode }) {
  const { data: list = [] } = useFetchPlaylists();
  const add = useAddPlaylistDialog();
  const edit = useEditPlaylistDialog(list);
  const { mutate: _remove } = useRemovePlaylist();

  const { mutate: _addMusic } = useAddPlaylistMusic();
  const { mutate: _removeMusics } = useRemovePlaylistMusics();

  const remove = useCallback(
    (targetIds: Playlist['id'][], options?: PlaylistActionOptions) => {
      _remove(targetIds, {
        onSuccess: options?.onSuccess,
      });
    },
    [_remove]
  );

  const addMusic = useCallback(
    (targetId: Playlist['id'], music: AddPlaylistMusicRequestBody) => {
      _addMusic({
        listId: targetId,
        ...music,
      });
    },
    [_addMusic]
  );

  const removeMusics = useCallback(
    (targetId: Playlist['id'], musicIds: number[]) => {
      _removeMusics({
        playlistId: targetId,
        listIds: musicIds,
      });
    },
    [_removeMusics]
  );

  return (
    <PlaylistActionContext.Provider
      value={{
        list,
        add,
        edit,
        remove,

        addMusic,
        removeMusics,
      }}
    >
      {children}
    </PlaylistActionContext.Provider>
  );
}
