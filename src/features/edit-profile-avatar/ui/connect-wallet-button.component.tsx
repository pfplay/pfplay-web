'use client';
import Image from 'next/image';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { cn } from '@/shared/lib/functions/cn';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { Button } from '@/shared/ui/components/button';
import { PFAdd, PFInfoOutline } from '@/shared/ui/icons';

const ConnectWalletButton = () => {
  const t = useI18n();

  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        const connected = mounted && account && chain;

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
