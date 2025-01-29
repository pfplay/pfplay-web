import type { ReactElement } from 'react';
import { PlaylistActionBypassProvider, usePlaylistAction } from '@/entities/playlist';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useStores } from '@/shared/lib/store/stores.context';
import { useDialog } from '@/shared/ui/components/dialog';
import { TextButton } from '@/shared/ui/components/text-button';
import { PFClose } from '@/shared/ui/icons';
import MusicSearch from './music-search.component';

type ChildrenProps = {
  text: string;
  execute: () => void;
};

type Props = {
  children: (props: ChildrenProps) => ReactElement;
};

export default function AddTracks({ children }: Props) {
  const t = useI18n();
  const { openDialog } = useDialog();
  const playlistAction = usePlaylistAction();
  const { useUIState } = useStores();
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

  return children({
    text: t.playlist.btn.add_song,
    execute: handleAddMusic,
  });
}
