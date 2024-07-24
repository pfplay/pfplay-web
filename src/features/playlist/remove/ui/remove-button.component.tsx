import { useStores } from '@/app/_providers/stores.context';
import { usePlaylistAction } from '@/entities/playlist';
import { Playlist } from '@/shared/api/http/types/playlists';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { Button } from '@/shared/ui/components/button';
import { Dialog, useDialog } from '@/shared/ui/components/dialog';
import { PFDelete } from '@/shared/ui/icons';

type RemoveButtonProps = {
  targetIds: Playlist['id'][];
  onSuccess?: () => void;
};

const RemoveButton = ({ targetIds, onSuccess }: RemoveButtonProps) => {
  const t = useI18n();
  const { openDialog } = useDialog();
  const playlistAction = usePlaylistAction();
  const { useUIState } = useStores();
  const playlistDrawer = useUIState((state) => state.playlistDrawer);

  const handleClick = () => {
    openDialog((_, onCancel) => ({
      zIndex: playlistDrawer.zIndex + 1,
      title: t.playlist.para.delete_playlist_confirm,
      Body: (
        <Dialog.ButtonGroup>
          <Dialog.Button color='secondary' onClick={onCancel}>
            {t.common.btn.cancel}
          </Dialog.Button>
          <Dialog.Button
            onClick={() =>
              playlistAction.remove(targetIds, {
                onSuccess: () => {
                  onSuccess?.();
                  onCancel?.();
                },
              })
            }
          >
            {t.common.btn.confirm}
          </Dialog.Button>
        </Dialog.ButtonGroup>
      ),
    }));
  };

  return (
    <Button
      size='sm'
      Icon={<PFDelete />}
      variant='outline'
      color='secondary'
      disabled={targetIds.length === 0}
      onClick={handleClick}
    >
      {t.common.btn.delete}
    </Button>
  );
};

export default RemoveButton;
