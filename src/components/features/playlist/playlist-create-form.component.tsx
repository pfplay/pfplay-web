import { SubmitHandler } from 'react-hook-form';
import { useCreatePlaylist } from '@/api/react-query/playlist/use-create-playlist.mutation';
import { ErrorCode } from '@/shared/api/types/@shared';
import Dialog from '@/shared/ui/components/dialog/dialog.component';
import { useDialog } from '@/shared/ui/components/dialog/use-dialog.hook';
import Typography from '@/shared/ui/components/typography/typography.component';
import PlaylistForm, { PlaylistFormProps, PlaylistFormType } from './playlist-form.component';

type PlaylistCreateFormProps = Pick<PlaylistFormProps, 'onCancel'>;
const PlaylistCreateForm = (props: PlaylistCreateFormProps) => {
  const { mutate: createPlaylist } = useCreatePlaylist();
  const { openDialog } = useDialog();

  const handleConnectWallet = () => {
    // TODO: 지갑 연동 기능 추가
    alert('지갑 연동');
  };

  const openNeedConnectWalletDialog = () => {
    return openDialog((_, onCancel) => ({
      title: '이미 생성 가능한 리스트 수를 초과했어요',
      Body: (
        <>
          <Typography type='body3'>지갑을 연동하시면 10개까지 생성할 수 있어요!</Typography>
          <Dialog.ButtonGroup>
            <Dialog.Button color='secondary' onClick={onCancel}>
              취소
            </Dialog.Button>
            <Dialog.Button onClick={handleConnectWallet}>지갑연동하기</Dialog.Button>
          </Dialog.ButtonGroup>
        </>
      ),
    }));
  };
  const openLimitDialog = () => {
    return openDialog((_, onCancel) => ({
      title: '이런! 생성 가능한 리스트 수를 초과했어요 최대 10개 까지만 생성이 가능해요',
      Body: (
        <Dialog.ButtonGroup>
          <Dialog.Button onClick={onCancel}>확인</Dialog.Button>
        </Dialog.ButtonGroup>
      ),
    }));
  };

  const handleSubmit: SubmitHandler<PlaylistFormType> = async ({ name }) => {
    createPlaylist(
      { name },
      {
        onError: (err) => {
          if (err.response?.data.errorCode === ErrorCode.REQUIRED_WALLET_CONNECT) {
            openNeedConnectWalletDialog();
          }
          if (err.response?.data.errorCode === ErrorCode.PLAYLIST_MAXIMUM_COUNT_EXCEED) {
            openLimitDialog();
          }
        },
        onSettled: () => props.onCancel?.(),
      }
    );
  };
  return <PlaylistForm onSubmit={handleSubmit} {...props} />;
};

export default PlaylistCreateForm;
