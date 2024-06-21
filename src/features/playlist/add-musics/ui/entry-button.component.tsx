import { usePlaylistAction } from '@/entities/playlist';
import { PlaylistActionBypassProvider } from '@/entities/playlist/lib/playlist-action.context';
import { Button } from '@/shared/ui/components/button';
import { useDialog } from '@/shared/ui/components/dialog';
import { PFAdd, PFClose } from '@/shared/ui/icons';
import YoutubeMusicSearch from './youtube-music-search.component';

const EntryButton = () => {
  const { openDialog } = useDialog();
  const playlistAction = usePlaylistAction();

  const handleAddMusic = () => {
    openDialog((_, onClose) => ({
      classNames: {
        container: '!p-[unset] w-[800px] bg-black border border-gray-700',
      },
      Body: (
        <PlaylistActionBypassProvider action={playlistAction}>
          <YoutubeMusicSearch
            extraAction={
              <button onClick={onClose}>
                <PFClose width={24} height={24} />
              </button>
            }
          />
        </PlaylistActionBypassProvider>
      ),
      hideDim: true,
    }));
  };

  return (
    <Button size='sm' variant='outline' color='secondary' Icon={<PFAdd />} onClick={handleAddMusic}>
      곡 추가
    </Button>
  );
};

export default EntryButton;
