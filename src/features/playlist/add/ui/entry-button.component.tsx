import { useIsGuest } from '@/entities/me';
import { useInformSocialType } from '@/features/sign-in/by-social';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { Button } from '@/shared/ui/components/button';
import { PFAdd } from '@/shared/ui/icons';
import useAddPlaylistDialog from './form.component';

const EntryButton = () => {
  const t = useI18n();
  const openAddDialog = useAddPlaylistDialog();
  const isGuest = useIsGuest();
  const informSocialType = useInformSocialType();

  const handleClick = async () => {
    if (await isGuest()) {
      informSocialType();
      return;
    }
    openAddDialog();
  };

  return (
    <Button
      size='sm'
      variant='outline'
      color='secondary'
      Icon={<PFAdd />}
      onClick={handleClick}
      data-testid='add-playlist-button'
    >
      {t.playlist.btn.add_list}
    </Button>
  );
};

export default EntryButton;
