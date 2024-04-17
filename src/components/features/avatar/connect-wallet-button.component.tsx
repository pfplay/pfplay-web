'use client';
import Image from 'next/image';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { cn } from '@/shared/lib/cn';
import Button from '@/shared/ui/components/button/button.component';
import { PFAdd } from '@/shared/ui/icons';

const ConnectWalletButton = () => {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        const connected = mounted && account && chain;

        if (chain?.unsupported) {
          return (
            <button onClick={openChainModal} type='button'>
              Wrong network
            </button>
          );
        }

        return (
          <div className={cn(!mounted && 'opacity-0 pointer-events-none user-select-none')}>
            {!connected ? (
              <Button
                type='button'
                variant='fill'
                color='secondary'
                Icon={<PFAdd />}
                className='px-[38px]'
                onClick={openConnectModal}
              >
                추가 연결
              </Button>
            ) : (
              <Button
                type='button'
                variant='outline'
                color='secondary'
                className='px-[38px]'
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
