import { ReadonlyDeep } from 'type-fest';
import { Playlist } from '@/shared/api/http/types/playlists';
import type { Next } from '@/shared/lib/functions/update';
import theme from '@/shared/ui/foundation/theme';

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

export const initialValues: ReadonlyDeep<Pick<Model, 'playlistDrawer'>> = Object.freeze({
  playlistDrawer: Object.freeze({
    open: false,
    interactable: true,
    zIndex: theme.zIndex.drawer,
    selectedPlaylist: undefined,
  }),
});
