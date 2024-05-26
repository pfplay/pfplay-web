import { Playlist } from '@/shared/api/types/playlist';
import { Button } from '@/shared/ui/components/button';
import { Dialog, useDialog } from '@/shared/ui/components/dialog';
import { PFDelete } from '@/shared/ui/icons';
import { useDeletePlaylist } from '../api/use-delete-playlist.mutation';

type RemoveButtonProps = {
  targetIds: Playlist['id'][];
};

const RemoveButton = ({ targetIds }: RemoveButtonProps) => {
  const { openDialog } = useDialog();
  const { mutate: deletePlaylist } = useDeletePlaylist();

  const handleClick = () => {
    openDialog((_, onCancel) => ({
      title: '정말 선택 항목을\n 리스트에서 삭제하시겠어요?',
      Body: (
        <Dialog.ButtonGroup>
          <Dialog.Button color='secondary' onClick={onCancel}>
            취소
          </Dialog.Button>
          <Dialog.Button
            onClick={() =>
              deletePlaylist(targetIds, {
                onSuccess: () => {
                  onCancel?.();
                },
              })
            }
          >
            확인
          </Dialog.Button>
        </Dialog.ButtonGroup>
      ),
    }));
  };

  return (
    <Button
      size='sm'
      Icon={<PFDelete />}
      variant='outline'
      color='secondary'
      disabled={targetIds.length === 0}
      onClick={handleClick}
    >
      삭제
    </Button>
  );
};

export default RemoveButton;
