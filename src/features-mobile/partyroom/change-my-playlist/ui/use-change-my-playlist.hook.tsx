'use client';
import { useCallback } from 'react';
import { useChangeMyPlaylist } from '@/features/partyroom/change-my-playlist';
import { useMobileSelectPlaylist } from '@/features-mobile/partyroom/select-playlist-for-djing';
import { Playlist } from '@/shared/api/http/types/playlists';

interface Args {
  partyroomId: number;
  playlists: Playlist[];
}

export default function useMobileChangeMyPlaylist({ partyroomId, playlists }: Args) {
  const { mutate: changeMutate } = useChangeMyPlaylist();
  const selectPlaylist = useMobileSelectPlaylist({ playlists });

  return useCallback(async () => {
    const selected = await selectPlaylist();
    if (!selected) return;
    changeMutate({ partyroomId, playlistId: selected.id });
  }, [partyroomId, selectPlaylist, changeMutate]);
}
