import { AddTracksToPlaylist } from '@/features/playlist/add-tracks';
import { Button } from '@/shared/ui/components/button';
import { PFAddPlaylist } from '@/shared/ui/icons';

export default function AddTracksButton() {
  return (
    <AddTracksToPlaylist>
      {({ text, execute }) => (
        <Button size='md' variant='fill' color='primary' Icon={<PFAddPlaylist />} onClick={execute}>
          {text}
        </Button>
      )}
    </AddTracksToPlaylist>
  );
}
