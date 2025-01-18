'use client';
import { ConnectWallet } from '@/entities/wallet';
import SuspenseWithErrorBoundary from '@/shared/api/http/error/suspense-with-error-boundary.component';
import { Button } from '@/shared/ui/components/button';

export default function ConnectWalletButton() {
  return (
    <SuspenseWithErrorBoundary>
      <ConnectWallet
        wrongNetworkRender={({ recommendedText, onClick, icon }) => (
          <Button
            variant='outline'
            color='primary'
            className='px-[24px]'
            Icon={icon}
            onClick={onClick}
          >
            {recommendedText}
          </Button>
        )}
        notConnectedRender={({ recommendedText, onClick, icon }) => (
          <Button
            variant='fill'
            color='secondary'
            className='px-[24px]'
            Icon={icon}
            onClick={onClick}
          >
            {recommendedText}
          </Button>
        )}
        connectedRender={({ recommendedText, onClick, icon }) => (
          <Button
            variant='outline'
            color='secondary'
            className='px-[24px]'
            Icon={icon}
            onClick={onClick}
          >
            {recommendedText}
            {/* FIXME: 지갑 이미 연결했는데 받아온 nft 목록이 없다면 "추가 연결하기" 문구 보여주기 - https://pfplay.slack.com/archives/C03QTFBU8QG/p1719734409860379?thread_ts=1719722146.310099&cid=C03QTFBU8QG */}
          </Button>
        )}
      />
    </SuspenseWithErrorBoundary>
  );
}
