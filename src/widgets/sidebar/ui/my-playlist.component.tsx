import { useEffect, useState } from 'react';
import { useUIState } from '@/entities/ui-state';
import { AddPlaylistButton } from '@/features/playlist/add';
import { AddMusicsToPlaylistButton } from '@/features/playlist/add-musics';
import { Playlists, EditablePlaylists, PlaylistListItem } from '@/features/playlist/list';
import { MusicsInPlaylist } from '@/features/playlist/list-musics';
import { RemovePlaylistButton } from '@/features/playlist/remove';
import { Playlist } from '@/shared/api/http/types/playlists';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { replaceVar } from '@/shared/lib/localization/split-render';
import { Drawer, DrawerProps } from '@/shared/ui/components/drawer';
import { TextButton } from '@/shared/ui/components/text-button';
import { PFArrowLeft } from '@/shared/ui/icons';

const MyPlaylist = () => {
  const t = useI18n();
  const { playlistDrawer, setPlaylistDrawer } = useUIState();
  const [editMode, setEditMode] = useState(false);
  const [removeTargets, setRemoveTargets] = useState<Playlist['id'][]>([]);

  const containerCommonProps: DrawerProps = {
    title: t.playlist.title.my_playlist,
    isOpen: playlistDrawer.open,
    close: () => setPlaylistDrawer({ open: false }),
    style: { zIndex: playlistDrawer.zIndex },
  };

  const selectPlaylist = (playlist: Playlist) => {
    setPlaylistDrawer({
      selectedPlaylist: playlist,
    });
  };

  const unselectPlaylist = () => {
    setPlaylistDrawer({
      selectedPlaylist: undefined,
    });
  };

  useEffect(() => {
    /**
     * 편집 모드 해제될 때 삭제 대상 선택한 것 초기화
     */
    if (!editMode) {
      setRemoveTargets([]);
    }
  }, [editMode]);

  useEffect(() => {
    /**
     * 드로워 닫힐 때 편집 모드 해제
     */
    if (!playlistDrawer.open) {
      setEditMode(false);
    }
  }, [playlistDrawer.open]);

  // TODO: interactable 대응
  if (playlistDrawer.selectedPlaylist) {
    return (
      <Drawer
        {...containerCommonProps}
        HeaderExtra={
          <TextButton onClick={unselectPlaylist} Icon={<PFArrowLeft width={24} height={24} />} />
        }
      >
        <div className='flexRow justify-between items-center mt-10 mb-6'>
          <div className='flexRow gap-3'>
            <AddMusicsToPlaylistButton />
          </div>
          <TextButton onClick={() => setEditMode(true)}>{t.common.btn.settings}</TextButton>
        </div>

        <PlaylistListItem
          key={playlistDrawer.selectedPlaylist.id}
          title={playlistDrawer.selectedPlaylist.name}
          InfoText={replaceVar(t.playlist.title.n_song, {
            $1: playlistDrawer.selectedPlaylist.musicCount,
          })}
        />

        <MusicsInPlaylist playlist={playlistDrawer.selectedPlaylist} />
      </Drawer>
    );
  }

  if (editMode) {
    return (
      <Drawer {...containerCommonProps}>
        <div className='flexRow justify-between items-center mt-10 mb-6'>
          <RemovePlaylistButton targetIds={removeTargets} onSuccess={() => setRemoveTargets([])} />
          <TextButton className='text-red-300' onClick={() => setEditMode(false)}>
            {t.common.btn.complete}
          </TextButton>
        </div>

        <EditablePlaylists onChangeSelectedItem={setRemoveTargets} />
      </Drawer>
    );
  }

  return (
    <Drawer {...containerCommonProps}>
      <div className='flexRow justify-between items-center mt-10 mb-6'>
        <div className='flexRow gap-3'>
          <AddMusicsToPlaylistButton />
          <AddPlaylistButton />
        </div>
        <TextButton onClick={() => setEditMode(true)}>{t.common.btn.settings}</TextButton>
      </div>

      <Playlists onClickItem={selectPlaylist} />
    </Drawer>
  );
};

export default MyPlaylist;
