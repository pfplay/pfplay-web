import { Button } from '@/shared/ui/components/button';
import { PFAdd } from '@/shared/ui/icons';
import useAddPlaylistDialog from './form.component';

const EntryButton = () => {
  const openAddDialog = useAddPlaylistDialog();

  return (
    <Button size='sm' variant='outline' color='secondary' Icon={<PFAdd />} onClick={openAddDialog}>
      리스트 추가
    </Button>
  );
};

export default EntryButton;
