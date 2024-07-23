import { useCallback } from 'react';
import { SubmitHandler } from 'react-hook-form';
import { PlaylistForm, PlaylistFormProps, PlaylistFormValues } from '@/entities/playlist';
import { useUIState } from '@/entities/ui-state';
import { ErrorCode } from '@/shared/api/http/types/@shared';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { Dialog } from '@/shared/ui/components/dialog';
import { useDialog } from '@/shared/ui/components/dialog';
import { Typography } from '@/shared/ui/components/typography';
import { useCreatePlaylist } from '../api/use-create-playlist.mutation';

export default function useAddPlaylistDialog() {
  const t = useI18n();
  const { openDialog } = useDialog();
  const playlistDrawer = useUIState((state) => state.playlistDrawer);

  return useCallback(() => {
    openDialog((_, onCancel) => ({
      zIndex: playlistDrawer.zIndex + 1,
      title: t.playlist.para.enter_playlist_name,
      Body: <Form onCancel={onCancel} />,
    }));
  }, [playlistDrawer.zIndex, t]);
}

type FormProps = Pick<PlaylistFormProps, 'onCancel'>;
const Form = (props: FormProps) => {
  const t = useI18n();
  const { mutate: createPlaylist } = useCreatePlaylist();
  const { openDialog } = useDialog();

  const handleConnectWallet = () => {
    // TODO: 지갑 연동 기능 추가
    alert('Not Impl');
  };

  const openNeedConnectWalletDialog = () => {
    return openDialog((_, onCancel) => ({
      title: t.playlist.ec.exceeded_list_connect_wallet,
      Body: (
        <>
          <Typography type='body3'>{t.playlist.para.up_to_10_if_connect_wallet}</Typography>
          <Dialog.ButtonGroup>
            <Dialog.Button color='secondary' onClick={onCancel}>
              {t.common.btn.cancel}
            </Dialog.Button>
            <Dialog.Button onClick={handleConnectWallet}>{t.auth.btn.connect_wallet}</Dialog.Button>
          </Dialog.ButtonGroup>
        </>
      ),
    }));
  };
  const openLimitDialog = () => {
    return openDialog((_, onCancel) => ({
      title: t.playlist.ec.exceeded_list,
      Body: (
        <Dialog.ButtonGroup>
          <Dialog.Button onClick={onCancel}>{t.common.btn.confirm}</Dialog.Button>
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
