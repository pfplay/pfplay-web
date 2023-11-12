'use client';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Button from '@/components/shared/atoms/Button';
import { PFAdd } from '@/components/shared/icons';

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
          <div
            {...(!mounted && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              // if (!connected) {
              //   return (
              //     <Button
              //       type='button'
              //       variant='fill'
              //       color='secondary'
              //       Icon={<PFAdd />}
              //       className='px-[38px]'
              //       onClick={openConnectModal}
              //     >
              //       추가 연결
              //     </Button>
              //   );
              // }

              return (
                <div className='flexRow items-center gap-5'>
                  {connected && (
                    <div className='flex gap-3 '>
                      <Button
                        type='button'
                        variant='outline'
                        color='secondary'
                        className='px-[38px]'
                        onClick={openAccountModal}
                      >
                        {account.displayName}
                      </Button>
                    </div>
                  )}

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
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};

export default ConnectWalletButton;
