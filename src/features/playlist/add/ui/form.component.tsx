import { useCallback } from 'react';
import { SubmitHandler } from 'react-hook-form';
import { useFetchMe } from '@/entities/me';
import { PlaylistFormValues } from '@/entities/playlist';
import { PlaylistForm, PlaylistFormProps } from '@/entities/playlist/index.ui';
import { ConnectWallet } from '@/entities/wallet/index.ui';
import useOnError from '@/shared/api/http/error/use-on-error.hook';
import { AuthorityTier } from '@/shared/api/http/types/@enums';
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
  const { data: me } = useFetchMe();

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
    // 티어별 한도가 달라(FM=10, AM=1) 문구를 분기한다. FM 외(AM/GT)는 한도 1.
    const isFullMember = me?.authorityTier === AuthorityTier.FM;
    return openDialog((_, onCancel) => ({
      title: isFullMember ? t.playlist.ec.exceeded_list : t.playlist.ec.exceeded_list_am,
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
