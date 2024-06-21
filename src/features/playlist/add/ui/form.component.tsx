import { useCallback } from 'react';
import { SubmitHandler } from 'react-hook-form';
import { PlaylistForm, PlaylistFormProps, PlaylistFormValues } from '@/entities/playlist';
import { ErrorCode } from '@/shared/api/types/@shared';
import { Dialog } from '@/shared/ui/components/dialog';
import { useDialog } from '@/shared/ui/components/dialog';
import { Typography } from '@/shared/ui/components/typography';
import { useCreatePlaylist } from '../api/use-create-playlist.mutation';

export default function useAddPlaylistDialog() {
  const { openDialog } = useDialog();

  return useCallback(() => {
    openDialog((_, onCancel) => ({
      title: '플레이리스트 이름을 입력해주세요',
      Body: <Form onCancel={onCancel} />,
    }));
  }, []);
}

type FormProps = Pick<PlaylistFormProps, 'onCancel'>;
const Form = (props: FormProps) => {
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

  const handleSubmit: SubmitHandler<PlaylistFormValues> = async ({ name }) => {
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
