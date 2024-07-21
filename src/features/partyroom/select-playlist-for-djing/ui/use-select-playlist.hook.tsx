import { useState } from 'react';
import { useUIState } from '@/entities/ui-state';
import { Playlist } from '@/shared/api/http/types/playlists';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { replaceVar } from '@/shared/lib/localization/split-render';
import { useDialog } from '@/shared/ui/components/dialog';
import Dialog from 'shared/ui/components/dialog/dialog.component';
import SelectPlaylist from './select-playlist.component';

type Props = {
  playlists: Playlist[];
  onSelect: (playlist: Playlist) => void;
};

export default function useSelectPlaylist({ playlists, onSelect }: Props) {
  const t = useI18n();
  const { openConfirmDialog, openDialog } = useDialog();
  const { setPlaylistDrawer } = useUIState();

  const guidePrepareSelect = async () => {
    const confirmed = await openConfirmDialog({
      content: t.dj.para.create_playlist_first,
    });
    if (confirmed) {
      setPlaylistDrawer({ open: true });
    }
  };

  const selectPlaylist = () => {
    openDialog((_, onCancel) => ({
      title: t.dj.btn.select_dj_playlist,
      Sub: replaceVar(t.dj.para.skipped_song_by_admin, { $1: 'n' }), // TODO: replace $1 with the actual number of skipped songs
      Body: () => {
        const [selected, setSelected] = useState<Playlist>();

        const handleConfirm = () => {
          if (!selected) return;
          onSelect(selected);
        };

        return (
          <>
            <div className='mt-[24px] mb-[36px]'>
              <SelectPlaylist
                playlists={playlists.filter((playlist) => !!playlist.musicCount)}
                onSelect={setSelected}
              />
            </div>

            <Dialog.ButtonGroup>
              <Dialog.Button onClick={onCancel}>{t.common.btn.cancel}</Dialog.Button>
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
