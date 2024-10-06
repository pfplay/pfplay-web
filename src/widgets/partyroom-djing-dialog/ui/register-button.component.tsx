import { useSelectPlaylistForDjing } from '@/features/partyroom/select-playlist-for-djing';
import { useFetchPlaylists } from '@/features/playlist/list';
import { QueueStatus } from '@/shared/api/http/types/@enums';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { Button } from '@/shared/ui/components/button';
import { useDialog } from '@/shared/ui/components/dialog';
import { useRegisterMeToQueue } from '../api/use-register-me-to-queue.mutation';
import { useDjingQueue } from '../lib/djing-queue.context';
import { usePartyroomId } from '../lib/partyroom-id.context';

export default function RegisterButton() {
  const t = useI18n();
  const { data: playlists = [] } = useFetchPlaylists();
  const { openAlertDialog } = useDialog();
  const selectPlaylist = useSelectPlaylistForDjing({ playlists });
  const partyroomId = usePartyroomId();
  const { mutate: registerMeToQueue } = useRegisterMeToQueue();
  const isLocked = useDjingQueue().queueStatus === QueueStatus.CLOSE;

  const registerMeToDjQueue = async () => {
    if (isLocked) {
      await openAlertDialog({ content: t.dj.para.locked_queue_by_admin });
      return;
    }

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
