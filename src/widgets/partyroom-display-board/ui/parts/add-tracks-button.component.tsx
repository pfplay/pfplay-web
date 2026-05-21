import { useIsGuest } from '@/entities/me';
import { AddTracksToPlaylist } from '@/features/playlist/add-tracks';
import { useInformSocialType } from '@/features/sign-in/by-social';
import { Button } from '@/shared/ui/components/button';
import { PFAddPlaylist } from '@/shared/ui/icons';

export default function AddTracksButton() {
  const isGuest = useIsGuest();
  const informSocialType = useInformSocialType();

  return (
    <AddTracksToPlaylist>
      {({ text, execute }) => (
        <Button
          size='md'
          variant='fill'
          color='primary'
          Icon={<PFAddPlaylist />}
          onClick={async () => {
            if (await isGuest()) {
              informSocialType();
              return;
            }
            execute();
          }}
        >
          {text}
        </Button>
      )}
    </AddTracksToPlaylist>
  );
}
