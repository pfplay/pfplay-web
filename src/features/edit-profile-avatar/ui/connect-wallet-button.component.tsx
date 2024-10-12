'use client';
import Image from 'next/image';
import { useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useSuspenseFetchMe } from '@/entities/me';
import { cn } from '@/shared/lib/functions/cn';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { Button } from '@/shared/ui/components/button';
import { PFAdd, PFInfoOutline } from '@/shared/ui/icons';
import { useUpdateMyWallet } from '../api/use-update-my-walllet.mutation';

const ConnectWalletButton = () => {
  const t = useI18n();
  const { data: me } = useSuspenseFetchMe();
  const { mutate: updateMyWallet } = useUpdateMyWallet();

  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        const connected = mounted && !!account && !!chain;

        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
          if (!me.walletAddress && connected) {
            updateMyWallet({ walletAddress: account.address });
          }
          if (!!me.walletAddress && !connected) {
            // TODO: 지갑연결 해제 시 api 나오면 대응
            // https://pfplay.slack.com/archives/C051N8A0ZSB/p1728730320680689?thread_ts=1728728907.644159&cid=C051N8A0ZSB
          }
        }, [connected]);

        if (chain?.unsupported) {
          return (
            <Button
              variant='outline'
              color='primary'
              className='px-[24px]'
              Icon={<PFInfoOutline />}
              onClick={openChainModal}
            >
              Wrong Network
            </Button>
          );
        }

        return (
          <div className={cn(!mounted && 'opacity-0 pointer-events-none user-select-none')}>
            {!connected ? (
              <Button
                variant='fill'
                color='secondary'
                className='px-[24px]'
                Icon={<PFAdd />}
                onClick={openConnectModal}
              >
                {t.settings.btn.addi_connection}
                {/* FIXME: 추가 연결하기 문구는 지갑 이미 연결했을 때만 보여주기 - https://pfplay.slack.com/archives/C03QTFBU8QG/p1719734409860379?thread_ts=1719722146.310099&cid=C03QTFBU8QG */}
              </Button>
            ) : (
              <Button
                variant='outline'
                color='secondary'
                className='px-[24px]'
                Icon={
                  chain.hasIcon &&
                  chain.iconUrl && (
                    <Image
                      alt={chain.name ?? 'Chain icon'}
                      src={chain.iconUrl}
                      width={16}
                      height={16}
                      className='rounded-[999px] overflow-hidden'
                    />
                  )
                }
                onClick={openAccountModal}
              >
                {account.displayName}
              </Button>
            )}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};

export default ConnectWalletButton;
