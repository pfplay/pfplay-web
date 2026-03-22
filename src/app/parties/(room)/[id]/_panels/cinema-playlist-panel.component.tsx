'use client';
import { useEffect, useState } from 'react';
import { usePlaylistAction } from '@/entities/playlist';
import { AddPlaylistButton } from '@/features/playlist/add';
import { AddTracksToPlaylist } from '@/features/playlist/add-tracks';
import { Playlists, EditablePlaylists, PlaylistListItem } from '@/features/playlist/list';
import { TracksInPlaylist } from '@/features/playlist/list-tracks';
import { RemovePlaylistButton } from '@/features/playlist/remove';
import { Playlist } from '@/shared/api/http/types/playlists';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { VariableProcessor } from '@/shared/lib/localization/renderer';
import { Trans } from '@/shared/lib/localization/renderer/index.ui';
import { useStores } from '@/shared/lib/store/stores.context';
import { Button } from '@/shared/ui/components/button';
import { TextButton } from '@/shared/ui/components/text-button';
import { PFAdd, PFArrowLeft, PFClose } from '@/shared/ui/icons';

type Props = {
  onClose: () => void;
};

export default function CinemaPlaylistPanel({ onClose }: Props) {
  const t = useI18n();
  const { useUIState } = useStores();
  const { playlistDrawer, setPlaylistDrawer } = useUIState();
  const { list: playlists } = usePlaylistAction();
  const [editMode, setEditMode] = useState(false);
  const [removeTargets, setRemoveTargets] = useState<Playlist['id'][]>([]);

  useEffect(() => {
    if (!editMode) setRemoveTargets([]);
  }, [editMode]);

  useEffect(() => {
    if (playlistDrawer.selectedPlaylist) {
      const recent = playlists.find((p) => p.id === playlistDrawer.selectedPlaylist?.id);
      setPlaylistDrawer({ selectedPlaylist: recent });
    }
  }, [playlists]);

  const selectPlaylist = (playlist: Playlist) => setPlaylistDrawer({ selectedPlaylist: playlist });
  const unselectPlaylist = () => setPlaylistDrawer({ selectedPlaylist: undefined });

  const header = (
    <div className='flex items-center justify-between mb-6'>
      <div className='flex items-center gap-2'>
        {playlistDrawer.selectedPlaylist && (
          <TextButton onClick={unselectPlaylist} Icon={<PFArrowLeft width={24} height={24} />} />
        )}
        <span className='text-white font-bold text-base'>
          {playlistDrawer.selectedPlaylist
            ? playlistDrawer.selectedPlaylist.name
            : t.playlist.title.my_playlist}
        </span>
      </div>
      <PFClose
        width={24}
        height={24}
        onClick={onClose}
        className='[&_*]:stroke-white cursor-pointer shrink-0'
      />
    </div>
  );

  if (playlistDrawer.selectedPlaylist) {
    return (
      <div className='h-full py-7 px-5 flex flex-col overflow-y-auto'>
        {header}
        <div className='mb-6'>
          <AddTracksToPlaylist>
            {({ text, execute }) => (
              <Button
                size='sm'
                variant='outline'
                color='secondary'
                Icon={<PFAdd />}
                onClick={execute}
              >
                {text}
              </Button>
            )}
          </AddTracksToPlaylist>
        </div>
        <PlaylistListItem
          title={playlistDrawer.selectedPlaylist.name}
          InfoText={
            <Trans
              i18nKey='playlist.title.n_song'
              processors={[
                new VariableProcessor({ count: playlistDrawer.selectedPlaylist.musicCount }),
              ]}
            />
          }
        />
        <div className='space-y-3 [&>:first-child]:pt-3'>
          <TracksInPlaylist playlist={playlistDrawer.selectedPlaylist} />
        </div>
      </div>
    );
  }

  if (editMode) {
    return (
      <div className='h-full py-7 px-5 flex flex-col overflow-y-auto'>
        {header}
        <div className='flex justify-between items-center mb-6'>
          <RemovePlaylistButton targetIds={removeTargets} onSuccess={() => setRemoveTargets([])} />
          <TextButton className='text-red-300' onClick={() => setEditMode(false)}>
            {t.common.btn.complete}
          </TextButton>
        </div>
        <EditablePlaylists onChangeSelectedItem={setRemoveTargets} />
      </div>
    );
  }

  return (
    <div className='h-full py-7 px-5 flex flex-col overflow-y-auto'>
      {header}
      <div className='flex justify-between items-center mb-6'>
        <div className='flex gap-3'>
          <AddTracksToPlaylist>
            {({ text, execute }) => (
              <Button
                size='sm'
                variant='outline'
                color='secondary'
                Icon={<PFAdd />}
                onClick={execute}
              >
                {text}
              </Button>
            )}
          </AddTracksToPlaylist>
          <AddPlaylistButton />
        </div>
        <TextButton onClick={() => setEditMode(true)}>{t.common.btn.settings}</TextButton>
      </div>
      <Playlists onClickItem={selectPlaylist} />
    </div>
  );
}
