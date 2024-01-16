import React from 'react';
import { SubmitHandler } from 'react-hook-form';
import { isAxiosError } from 'axios';
import { ErrorResponse } from '@/api/@types/@shared';
import { useCreatePlaylistMutation } from '@/api/query-temp/playlist/useCreatePlaylistMutation.tsx';
import Dialog from '@/components/shared/Dialog';
import Typography from '@/components/shared/atoms/Typography';
import { useDialog } from '@/hooks/useDialog';
import PlaylistForm, { PlaylistFormProps, PlaylistFormType } from './PlaylistForm';

type PlaylistCreateFormProps = Pick<PlaylistFormProps, 'onCancel'>;
const PlaylistCreateForm = (props: PlaylistCreateFormProps) => {
  const { mutate } = useCreatePlaylistMutation();
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
    mutate(
      { name },
      {
        onError: (err) => {
          if (isAxiosError<ErrorResponse>(err)) {
            if (err.response?.data.data.errorCode === 'BR001') {
              openNeedConnectWalletDialog();
            }

            if (err.response?.data.data.errorCode === 'BR002') {
              openLimitDialog();
            }
          }
        },
        onSettled: () => props.onCancel?.(),
      }
    );
  };
  return <PlaylistForm onSubmit={handleSubmit} {...props} />;
};

export default PlaylistCreateForm;
