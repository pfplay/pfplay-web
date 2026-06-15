'use client';
import { FC, useState } from 'react';
import SelectPlaylist from '@/features-mobile/partyroom/select-playlist-for-djing/ui/select-playlist.component';
import { Playlist } from '@/shared/api/http/types/playlists';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { Button } from '@/shared/ui/components/button';

interface Props {
  playlists: Playlist[];
  onConfirm: (playlist: Playlist) => void;
  onCancel: () => void;
  onAddTracksForEmpty: (playlist: Playlist) => void;
}

const SelectPlaylistSheet: FC<Props> = ({
  playlists,
  onConfirm,
  onCancel,
  onAddTracksForEmpty,
}) => {
  const t = useI18n();
  const [selected, setSelected] = useState<Playlist | undefined>(undefined);

  return (
    <div className='flex flex-col h-full'>
      <div className='flex-1 overflow-y-auto'>
        <SelectPlaylist
          playlists={playlists}
          onSelect={setSelected}
          onAddTracksForEmpty={onAddTracksForEmpty}
        />
      </div>
      <div className='shrink-0 grid grid-cols-2 gap-3 p-4'>
        <Button
          data-testid='select-playlist-cancel'
          color='secondary'
          variant='outline'
          onClick={onCancel}
        >
          {t.common.btn.cancel}
        </Button>
        <Button
          data-testid='select-playlist-confirm'
          disabled={!selected}
          onClick={() => selected && onConfirm(selected)}
        >
          {t.partyroom.queue.sheet_select_confirm}
        </Button>
      </div>
    </div>
  );
};

export default SelectPlaylistSheet;
