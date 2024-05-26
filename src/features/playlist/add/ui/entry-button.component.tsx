import { Button } from '@/shared/ui/components/button';
import { useDialog } from '@/shared/ui/components/dialog';
import { PFAdd } from '@/shared/ui/icons';
import Form from './form.component';

const EntryButton = () => {
  const { openDialog } = useDialog();

  const handleAddList = () => {
    openDialog((_, onCancel) => ({
      title: '플레이리스트 이름을 입력해주세요',
      Body: <Form onCancel={onCancel} />,
    }));
  };

  return (
    <Button size='sm' variant='outline' color='secondary' Icon={<PFAdd />} onClick={handleAddList}>
      리스트 추가
    </Button>
  );
};

export default EntryButton;
