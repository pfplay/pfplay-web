import { useEffect, useState } from 'react';
import { Playlist } from '@/shared/api/http/types/playlists';
import useDidUpdateEffect from '@/shared/lib/hooks/use-did-update-effect';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { replaceVar } from '@/shared/lib/localization/split-render';
import { useStores } from '@/shared/lib/store/stores.context';
import { useDialog } from '@/shared/ui/components/dialog';
import { Typography } from '@/shared/ui/components/typography';
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
  const { useUIState } = useStores();
  const setPlaylistDrawer = useUIState((state) => state.setPlaylistDrawer);

  const guidePrepareSelect = async () => {
    const confirmed = await openConfirmDialog({
      content: t.dj.para.create_playlist_song,
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
      Sub: (
        <Typography type='detail1' className='text-center text-gray-300'>
          {/* TODO: replace $1 with the actual number of skipped songs */}
          {replaceVar(t.dj.para.skipped_song_by_admin, { $1: 'n' })}
        </Typography>
      ),
      Body: () => {
        const { useUIState } = useStores();
        const setPlaylistDrawer = useUIState((state) => state.setPlaylistDrawer);
        const [selected, setSelected] = useState<Playlist>();

        const closePlaylistDrawer = () => {
          setPlaylistDrawer({
            open: false,
          });
        };

        const playlistDrawerWithSelectPlaylist = (playlist: Playlist) => {
          setPlaylistDrawer({
            open: true,
            interactable: false,
            zIndex: theme.zIndex.dialog + 1,
            selectedPlaylist: playlist,
          });
        };

        const handleCancel = () => {
          onCancel?.();
          closePlaylistDrawer();
        };

        const handleConfirm = () => {
          if (!selected) return;
          onOk(selected);
          closePlaylistDrawer();
        };

        useDidUpdateEffect(() => {
          closePlaylistDrawer();
        }, []);

        useEffect(() => {
          if (!selected) return;

          playlistDrawerWithSelectPlaylist(selected);
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
              <Dialog.Button onClick={handleCancel} color='secondary'>
                {t.common.btn.cancel}
              </Dialog.Button>
              <Dialog.Button onClick={handleConfirm} disabled={!selected}>
                {t.common.btn.confirm}
              </Dialog.Button>
            </Dialog.ButtonGroup>
          </>
        );
      },
      closeWhenOverlayClicked: false, // true가 되면, 드로워가 열리고 overlay를 클릭하여 닫았을때 drawer를 다시는 닫을 수 없게됩니다.
    }));
  };

  if (!playlists.length || playlists.every((playlist) => playlist.musicCount === 0)) {
    return guidePrepareSelect;
  }
  return selectPlaylist;
}
