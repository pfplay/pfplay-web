import { useCallback } from 'react';
import { SubmitHandler } from 'react-hook-form';
import { PlaylistForm, PlaylistFormProps, PlaylistFormValues } from '@/entities/playlist';
import { ConnectWallet } from '@/entities/wallet';
import useOnError from '@/shared/api/http/error/use-on-error.hook';
import { ErrorCode } from '@/shared/api/http/types/@shared';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useStores } from '@/shared/lib/store/stores.context';
import { Dialog } from '@/shared/ui/components/dialog';
import { useDialog } from '@/shared/ui/components/dialog';
import { Typography } from '@/shared/ui/components/typography';
import { useCreatePlaylist } from '../api/use-create-playlist.mutation';

export default function useAddPlaylistDialog() {
  const t = useI18n();
  const { openDialog } = useDialog();
  const { useUIState } = useStores();
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
            <ConnectWallet
              notConnectedRender={({ onClick, recommendedText }) => (
                <Dialog.Button
                  onClick={() => {
                    onClick();
                    onCancel?.();
                  }}
                >
                  {recommendedText}
                </Dialog.Button>
              )}
            />
          </Dialog.ButtonGroup>
        </>
      ),
      classNames: {
        container: 'w-[450px]',
      },
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
        onSettled: () => props.onCancel?.(),
      }
    );
  };

  useOnError(ErrorCode.NO_WALLET, openNeedConnectWalletDialog);
  useOnError(ErrorCode.EXCEEDED_PLAYLIST_LIMIT, openLimitDialog);

  return <PlaylistForm onSubmit={handleSubmit} {...props} />;
};
