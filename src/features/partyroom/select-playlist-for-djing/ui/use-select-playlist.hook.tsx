import { useEffect, useState } from 'react';
import { useUIState } from '@/entities/ui-state';
import { Playlist } from '@/shared/api/http/types/playlists';
import useDidMountEffect from '@/shared/lib/hooks/use-did-mount-effect';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { replaceVar } from '@/shared/lib/localization/split-render';
import { useDialog } from '@/shared/ui/components/dialog';
import theme from '@/shared/ui/foundation/theme';
import Dialog from 'shared/ui/components/dialog/dialog.component';
import SelectPlaylist from './select-playlist.component';

type Props = {
  playlists: Playlist[];
};

/**
 * void를 반환한다면 선택을 직접 취소했거나, 선택을 위한 조건을 만족하지 못한 것입니다.
 */
export default function useSelectPlaylist({ playlists }: Props): () => Promise<Playlist | void> {
  const t = useI18n();
  const { openConfirmDialog, openDialog } = useDialog();
  const { setPlaylistDrawer } = useUIState();

  const guidePrepareSelect = async () => {
    const confirmed = await openConfirmDialog({
      content: t.dj.para.create_playlist_first,
    });
    if (confirmed) {
      setPlaylistDrawer({
        open: true,
        zIndex: theme.zIndex.dialog + 1,
      });
    }
  };

  const selectPlaylist = () => {
    return openDialog<Playlist>((onOk, onCancel) => ({
      title: t.dj.btn.select_dj_playlist,
      Sub: replaceVar(t.dj.para.skipped_song_by_admin, { $1: 'n' }), // TODO: replace $1 with the actual number of skipped songs
      Body: () => {
        const [selected, setSelected] = useState<Playlist>();
        const { setPlaylistDrawer } = useUIState();

        const handleConfirm = () => {
          if (!selected) return;
          onOk(selected);
        };

        useDidMountEffect(() => {
          setPlaylistDrawer({
            open: false,
          });
        }, []);

        useEffect(() => {
          if (!selected) return;

          setPlaylistDrawer({
            open: true,
            interactable: false,
            zIndex: theme.zIndex.dialog + 1,
            selectedPlaylist: selected.id,
          });
        }, [selected]);

        return (
          <>
            <div className='mt-[24px] mb-[36px]'>
              <SelectPlaylist
                playlists={playlists.filter((playlist) => !!playlist.musicCount)}
                onSelect={setSelected}
              />
            </div>

            <Dialog.ButtonGroup>
              <Dialog.Button onClick={onCancel} color='secondary'>
                {t.common.btn.cancel}
              </Dialog.Button>
              <Dialog.Button onClick={handleConfirm} disabled={!selected}>
                {t.common.btn.confirm}
              </Dialog.Button>
            </Dialog.ButtonGroup>
          </>
        );
      },
    }));
  };

  if (!playlists.length || playlists.every((playlist) => playlist.musicCount === 0)) {
    return guidePrepareSelect;
  }
  return selectPlaylist;
}
