import { usePlaylistAction } from '@/entities/playlist';
import { PlaylistActionBypassProvider } from '@/entities/playlist/lib/playlist-action.context';
import { useUIState } from '@/entities/ui-state';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { Button } from '@/shared/ui/components/button';
import { useDialog } from '@/shared/ui/components/dialog';
import { TextButton } from '@/shared/ui/components/text-button';
import { PFAdd, PFClose } from '@/shared/ui/icons';
import MusicSearch from './music-search.component';

const EntryButton = () => {
  const t = useI18n();
  const { openDialog } = useDialog();
  const playlistAction = usePlaylistAction();
  const playlistDrawer = useUIState((state) => state.playlistDrawer);

  const handleAddMusic = () => {
    openDialog((_, onClose) => ({
      zIndex: playlistDrawer.zIndex + 1,
      classNames: {
        container: '!p-[unset] w-[800px] bg-black border border-gray-700',
      },
      Body: (
        <PlaylistActionBypassProvider action={playlistAction}>
          <MusicSearch
            extraAction={<TextButton onClick={onClose} Icon={<PFClose width={24} height={24} />} />}
          />
        </PlaylistActionBypassProvider>
      ),
    }));
  };

  return (
    <Button size='sm' variant='outline' color='secondary' Icon={<PFAdd />} onClick={handleAddMusic}>
      {t.playlist.btn.add_song}
    </Button>
  );
};

export default EntryButton;
