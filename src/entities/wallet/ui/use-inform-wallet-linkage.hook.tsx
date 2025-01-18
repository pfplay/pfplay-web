import { useIsWalletLinked } from '@/entities/wallet';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useDialog } from '@/shared/ui/components/dialog';
import Dialog from '@/shared/ui/components/dialog/dialog.component';
import { Typography } from '@/shared/ui/components/typography';
import ConnectWallet from './connect-wallet.component';

export default function useInformWalletLinkage() {
  const t = useI18n();
  const { openDialog } = useDialog();
  const isWalletLinked = useIsWalletLinked();

  return async () => {
    const walletLinked = await isWalletLinked();
    if (walletLinked) return;

    openDialog<void>((_, onCancel) => ({
      title: t.auth.para.need_wallet,
      Sub: (
        <Typography
          type='detail1'
          className='text-gray-300 underline'
          as='a'
          href='https://chromewebstore.google.com/detail/rainbow/opfgelmcmbiajamepnmloijbpoleiama'
          target='_blank'
          rel='noreferrer noopener'
        >
          {t.auth.para.about_wallet}
        </Typography>
      ),
      Body: () => (
        <Dialog.ButtonGroup>
          <Dialog.Button color='secondary' onClick={onCancel}>
            {t.common.btn.cancel}
          </Dialog.Button>
          <ConnectWallet
            wrongNetworkRender={({ onClick, icon, recommendedText }) => (
              <Dialog.Button
                onClick={() => {
                  onClick();
                  onCancel?.();
                }}
                Icon={icon}
              >
                {recommendedText}
              </Dialog.Button>
            )}
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
            connectedRender={({ icon }) => (
              <Dialog.Button onClick={onCancel} Icon={icon}>
                Already connected{/* Something went wrong */}
              </Dialog.Button>
            )}
          />
        </Dialog.ButtonGroup>
      ),
    }));
  };
}
