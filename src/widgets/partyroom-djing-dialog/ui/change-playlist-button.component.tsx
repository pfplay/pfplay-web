import { useChangeMyPlaylist } from '@/features/partyroom/change-my-playlist';
import { useSelectPlaylistForDjing } from '@/features/partyroom/select-playlist-for-djing';
import { useFetchPlaylists } from '@/features/playlist/list';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { Button } from '@/shared/ui/components/button';
import { usePartyroomId } from '../lib/partyroom-id.context';

export default function ChangePlaylistButton() {
  const t = useI18n();
  const { data: playlists = [] } = useFetchPlaylists();
  const selectPlaylist = useSelectPlaylistForDjing({ playlists });
  const partyroomId = usePartyroomId();
  const { mutate: changeMyPlaylist } = useChangeMyPlaylist();

  const handleChangePlaylist = async () => {
    const selected = await selectPlaylist();
    if (!selected) return; // canceled

    changeMyPlaylist({ partyroomId, playlistId: selected.id });
  };

  return (
    <Button
      color='primary'
      variant='outline'
      size='sm'
      onClick={handleChangePlaylist}
      data-testid='change-playlist-button'
    >
      {t.playlist.btn.change_playlist}
    </Button>
  );
}
