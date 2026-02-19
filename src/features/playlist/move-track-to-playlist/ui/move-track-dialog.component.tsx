import { useCallback, useState } from 'react';
import useOnError from '@/shared/api/http/error/use-on-error.hook';
import { ErrorCode } from '@/shared/api/http/types/@shared';
import { Playlist } from '@/shared/api/http/types/playlists';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useStores } from '@/shared/lib/store/stores.context';
import { Dialog, useDialog } from '@/shared/ui/components/dialog';
import { RadioSelectList } from '@/shared/ui/components/radio-select-list';
import { Typography } from '@/shared/ui/components/typography';
import { useMovePlaylistTrack } from '../api/use-move-playlist-track.mutation';

export default function useMoveTrackToPlaylistDialog(list: Playlist[]) {
  const t = useI18n();
  const { openDialog } = useDialog();
  const { useUIState } = useStores();
  const playlistDrawer = useUIState((state) => state.playlistDrawer);

  return useCallback(
    (sourcePlaylistId: number, trackId: number) => {
      const movableList = list.filter((p) => p.id !== sourcePlaylistId);

      openDialog((_, onCancel) => ({
        zIndex: playlistDrawer.zIndex + 1,
        title: t.playlist.title.select,
        Sub: (
          <Typography type='body3' className='text-gray-400'>
            {t.playlist.para.select_for_move}
          </Typography>
        ),
        Body: (
          <MoveTrackBody
            movableList={movableList}
            sourcePlaylistId={sourcePlaylistId}
            trackId={trackId}
            onCancel={onCancel}
          />
        ),
      }));
    },
    [list, playlistDrawer.zIndex, t]
  );
}

type MoveTrackBodyProps = {
  movableList: Playlist[];
  sourcePlaylistId: number;
  trackId: number;
  onCancel?: () => void;
};

const MoveTrackBody = ({
  movableList,
  sourcePlaylistId,
  trackId,
  onCancel,
}: MoveTrackBodyProps) => {
  const t = useI18n();
  const { openAlertDialog } = useDialog();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { mutate: moveTrack, isPending } = useMovePlaylistTrack();

  useOnError(ErrorCode.DUPLICATE_TRACK_IN_PLAYLIST, () => {
    openAlertDialog({ content: t.playlist.ec.duplicate_track_move });
  });

  useOnError(ErrorCode.EXCEEDED_TRACK_LIMIT, () => {
    openAlertDialog({ content: t.playlist.ec.exceeded_track_limit_move });
  });

  const handleConfirm = () => {
    if (selectedId === null) return;

    moveTrack(
      {
        playlistId: sourcePlaylistId,
        trackId,
        targetPlaylistId: selectedId,
      },
      {
        onSuccess: () => onCancel?.(),
      }
    );
  };

  if (movableList.length === 0) {
    return (
      <>
        <Typography type='body3' className='text-gray-400 mt-2 text-center'>
          {t.playlist.para.no_other_playlist}
        </Typography>

        <Dialog.ButtonGroup>
          <Dialog.Button onClick={() => onCancel?.()}>{t.common.btn.confirm}</Dialog.Button>
        </Dialog.ButtonGroup>
      </>
    );
  }

  return (
    <>
      <RadioSelectList
        items={movableList.map((playlist) => ({ value: playlist.id, label: playlist.name }))}
        value={selectedId}
        onChange={setSelectedId}
      />

      <Dialog.ButtonGroup>
        <Dialog.Button color='secondary' onClick={() => onCancel?.()}>
          {t.common.btn.cancel}
        </Dialog.Button>
        <Dialog.Button disabled={selectedId === null || isPending} onClick={handleConfirm}>
          {t.common.btn.confirm}
        </Dialog.Button>
      </Dialog.ButtonGroup>
    </>
  );
};
