import { useI18n } from '@/shared/lib/localization/i18n.context';
import { Button } from '@/shared/ui/components/button';
import { PFAdd } from '@/shared/ui/icons';
import useAddPlaylistDialog from './form.component';

const EntryButton = () => {
  const t = useI18n();
  const openAddDialog = useAddPlaylistDialog();

  return (
    <Button size='sm' variant='outline' color='secondary' Icon={<PFAdd />} onClick={openAddDialog}>
      {t.playlist.btn.add_list}
    </Button>
  );
};

export default EntryButton;
