import { default as PlaylistActionProvider } from './lib/playlist-action.provider';
import { default as _MyPlaylist } from './ui/my-playlist.component';

export function MyPlaylist() {
  return (
    <PlaylistActionProvider>
      <_MyPlaylist />
    </PlaylistActionProvider>
  );
}
