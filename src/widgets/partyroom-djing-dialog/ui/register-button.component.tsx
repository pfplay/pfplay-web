import { useSelectPlaylistForDjing } from '@/features/partyroom/select-playlist-for-djing';
import { useFetchPlaylists } from '@/features/playlist/list';
import { LocalStorageKeys } from '@/shared/config/local-storage-keys';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { Button } from '@/shared/ui/components/button';
import useShowDjingRuleDialog from './use-show-djing-rule-dialog.hook';
import { useRegisterMeToQueue } from '../api/use-register-me-to-queue.mutation';
import { usePartyroomId } from '../lib/partyroom-id.context';

export default function RegisterButton() {
  const t = useI18n();
  const { data: playlists = [] } = useFetchPlaylists();
  const selectPlaylist = useSelectPlaylistForDjing({ playlists });
  const showDjingRuleDialog = useShowDjingRuleDialog();
  const partyroomId = usePartyroomId();
  const { mutate: registerMeToQueue } = useRegisterMeToQueue();

  const registerMeToDjQueue = async () => {
    const playlist = await selectPlaylist();
    if (!playlist) return;

    if (!localStorage.getItem(LocalStorageKeys.HIDE_DJING_RULES_MODAL)) {
      await showDjingRuleDialog();
    }

    registerMeToQueue({
      partyroomId,
      playlistId: playlist.id,
    });
  };

  return (
    <Button size='lg' onClick={registerMeToDjQueue}>
      {t.dj.btn.register_queue}
    </Button>
  );
}
