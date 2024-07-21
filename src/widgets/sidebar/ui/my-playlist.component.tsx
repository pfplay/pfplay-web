import { useState } from 'react';
import { AddPlaylistButton } from '@/features/playlist/add';
import { AddMusicsToPlaylistButton } from '@/features/playlist/add-musics';
import { CollapsablePlaylists, EditablePlaylists } from '@/features/playlist/list';
import { MusicsInPlaylist } from '@/features/playlist/list-musics';
import { RemovePlaylistButton } from '@/features/playlist/remove';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { Drawer } from '@/shared/ui/components/drawer';
import { TextButton } from '@/shared/ui/components/text-button';

interface MyPlaylistProps {
  isDrawerOpen: boolean;
  closeDrawer: () => void;
}

// TODO: 별도 위젯으로 분리
const MyPlaylist = ({ isDrawerOpen, closeDrawer }: MyPlaylistProps) => {
  const t = useI18n();
  const [editMode, setEditMode] = useState(false);
  const [selectedPlaylistIds, setSelectedPlaylistIds] = useState<number[]>([]);

  const handleEditConfirm = () => {
    setEditMode(false);
  };

  return (
    <Drawer title={t.playlist.title.my_playlist} isOpen={isDrawerOpen} close={closeDrawer}>
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
