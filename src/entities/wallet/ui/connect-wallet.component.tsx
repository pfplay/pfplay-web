'use client';
import Image from 'next/image';
import { ReactNode, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useSuspenseFetchMe } from '@/entities/me';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { PFAdd, PFInfoOutline } from '@/shared/ui/icons';
import useUpdateMyWallet from '../api/use-update-my-walllet.mutation';

type RendererProps = {
  recommendedText: string;
  onClick: () => void;
  icon?: ReactNode;
};

type ConnectWalletProps = {
  wrongNetworkRender?: (props: RendererProps) => ReactNode;
  notConnectedRender?: (props: RendererProps) => ReactNode;
  connectedRender?: (props: RendererProps) => ReactNode;
};

export default function ConnectWallet({
  wrongNetworkRender,
  notConnectedRender,
  connectedRender,
}: ConnectWalletProps) {
  const t = useI18n();
  const { data: me } = useSuspenseFetchMe();
  const { mutate: updateMyWallet } = useUpdateMyWallet();

  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal }) => {
        const walletConnected = !!account && !!chain;

        useEffect(() => {
          if (!walletConnected && !!me.walletAddress) {
            updateMyWallet({ walletAddress: '' });
          }
          if (walletConnected && (!me.walletAddress || me.walletAddress !== account.address)) {
            updateMyWallet({ walletAddress: account.address });
          }
        }, [walletConnected]);

        if (chain?.unsupported) {
          return wrongNetworkRender?.({
            recommendedText: 'Wrong Network',
            onClick: openChainModal,
            icon: <PFInfoOutline />,
          });
        }

        if (!walletConnected) {
          return notConnectedRender?.({
            recommendedText: t.settings.btn.addi_connection,
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
