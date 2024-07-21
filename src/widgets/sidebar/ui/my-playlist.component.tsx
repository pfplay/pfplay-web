import { useState } from 'react';
import { useUIState } from '@/entities/ui-state';
import { AddPlaylistButton } from '@/features/playlist/add';
import { AddMusicsToPlaylistButton } from '@/features/playlist/add-musics';
import { CollapsablePlaylists, EditablePlaylists } from '@/features/playlist/list';
import { MusicsInPlaylist } from '@/features/playlist/list-musics';
import { RemovePlaylistButton } from '@/features/playlist/remove';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { Drawer } from '@/shared/ui/components/drawer';
import { TextButton } from '@/shared/ui/components/text-button';

const MyPlaylist = () => {
  const t = useI18n();
  const [editMode, setEditMode] = useState(false);
  const [selectedPlaylistIds, setSelectedPlaylistIds] = useState<number[]>([]);
  const { playlistDrawer, setPlaylistDrawer } = useUIState();

  const close = () => {
    setPlaylistDrawer({ open: false });
  };

  const handleEditConfirm = () => {
    setEditMode(false);
  };

  // TODO: interactable 대응
  // TODO: 아코디언 > 페이지 대응
  return (
    <Drawer
      title={t.playlist.title.my_playlist}
      isOpen={playlistDrawer.open}
      close={close}
      style={{ zIndex: playlistDrawer.zIndex }}
    >
      <div className='flexRow justify-between items-center mt-10 mb-6'>
        {editMode ? (
          <>
            <RemovePlaylistButton
              targetIds={selectedPlaylistIds}
              onSuccess={() => setSelectedPlaylistIds([])}
            />
            <TextButton className='text-red-300' onClick={handleEditConfirm}>
              {t.common.btn.complete}
            </TextButton>
          </>
        ) : (
          <>
            <div className='flexRow gap-3'>
              <AddMusicsToPlaylistButton />
              <AddPlaylistButton />
            </div>
            <TextButton onClick={() => setEditMode(true)}>{t.common.btn.settings}</TextButton>
          </>
        )}
      </div>

      {editMode ? (
        <EditablePlaylists onChangeSelectedItem={setSelectedPlaylistIds} />
      ) : (
        <CollapsablePlaylists
          musicsRender={(playlist) => <MusicsInPlaylist playlist={playlist} />}
        />
      )}
    </Drawer>
  );
};

export default MyPlaylist;
