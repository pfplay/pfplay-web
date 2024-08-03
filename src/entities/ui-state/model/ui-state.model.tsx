import { Playlist } from '@/shared/api/http/types/playlists';
import type { Next } from '@/shared/lib/functions/update';

type PlaylistDrawerState = {
  open: boolean;
  interactable: boolean;
  zIndex: number;
  selectedPlaylist: Playlist | undefined;
};

export type Model = {
  playlistDrawer: PlaylistDrawerState;
  setPlaylistDrawer: (v: Next<PlaylistDrawerState>) => void;
};
