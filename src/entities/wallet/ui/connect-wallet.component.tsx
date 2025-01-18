import Image from 'next/image';
import { ReactNode } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { PFAdd, PFInfoOutline } from '@/shared/ui/icons';

type RendererProps = {
  recommendedText: string;
  onClick: () => void;
  icon?: ReactNode;
};

type ConnectWalletProps = {
  notConnectedRender: (props: RendererProps) => ReactNode;
  connectedRender?: (props: RendererProps) => ReactNode;
  wrongNetworkRender?: (props: RendererProps) => ReactNode;
};

export default function ConnectWallet({
  wrongNetworkRender,
  notConnectedRender,
  connectedRender,
}: ConnectWalletProps) {
  const t = useI18n();

  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal }) => {
        const walletConnected = !!account && !!chain;

        if (chain?.unsupported) {
          return wrongNetworkRender?.({
            recommendedText: 'Wrong Network',
            onClick: openChainModal,
            icon: <PFInfoOutline />,
          });
        }

        if (!walletConnected) {
          return notConnectedRender?.({
            recommendedText: t.auth.btn.connect_wallet,
            onClick: openConnectModal,
            icon: <PFAdd />,
          });
        }

        return connectedRender?.({
          recommendedText: account.displayName,
          onClick: openAccountModal,
          icon: chain.hasIcon && chain.iconUrl && (
            <Image
              alt={chain.name ?? 'Chain icon'}
              src={chain.iconUrl}
              width={16}
              height={16}
              className='rounded-[999px] overflow-hidden'
            />
          ),
        });
      }}
    </ConnectButton.Custom>
  );
}
