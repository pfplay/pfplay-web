import { useSelectPlaylistForDjing } from '@/features/partyroom/select-playlist-for-djing';
import { useFetchPlaylists } from '@/features/playlist/list';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { Button } from '@/shared/ui/components/button';
import { useRegisterMeToQueue } from '../api/use-register-me-to.queue';
import { usePartyroomId } from '../lib/partyroom-id.context';

export default function RegisterButton() {
  const t = useI18n();
  const { data: playlists = [] } = useFetchPlaylists();
  const selectPlaylist = useSelectPlaylistForDjing({ playlists });
  const partyroomId = usePartyroomId();
  const { mutate: registerMeToQueue } = useRegisterMeToQueue();

  const registerMeToDjQueue = async () => {
    const selectedPlaylist = await selectPlaylist();
    if (!selectedPlaylist) return; // canceled

    // TODO: 디제잉 규칙 안내 팝업 보여주기

    registerMeToQueue({
      partyroomId,
      playlistId: selectedPlaylist.id,
    });
  };

  return (
    <Button size='lg' onClick={registerMeToDjQueue}>
      {t.dj.btn.register_queue}
    </Button>
  );
}
