'use client';
import SuspenseWithErrorBoundary from '@/shared/api/suspense-with-error-boundary.component';
import { cn } from '@/shared/lib/functions/cn';
import { useVerticalStretch } from '@/shared/lib/hooks/use-vertical-stretch.hook';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { Typography } from '@/shared/ui/components/typography';
import { PFInfoOutline } from '@/shared/ui/icons';
import AvatarFaceListItem from './avatar-face-list-item.component';
import ConnectWalletButton from './connect-wallet-button.component';
import { useFetchAvatarFaces } from '../api/use-fetch-avatar-faces.query';
import { useSelectedAvatarState } from '../lib/selected-avatar-state.context';
import useNfts from '../lib/use-nfts.hook';

const AvatarFaceList = () => {
  const t = useI18n();
  const { data: faces = [] } = useFetchAvatarFaces();
  const nfts = useNfts();
  const containerRef = useVerticalStretch<HTMLDivElement>();
  const selectedAvatar = useSelectedAvatarState();
  const combinable = (() => {
    if (!selectedAvatar.body) return true;
    return selectedAvatar.body.combinable;
  })();

  return (
    <div ref={containerRef} className='flex-1 flexCol gap-4 overflow-hidden'>
      <div className='flexRow justify-end items-center gap-3'>
        <SuspenseWithErrorBoundary>
          <ConnectWalletButton />
        </SuspenseWithErrorBoundary>
      </div>
      <div
        className={cn(
          'relative flex-1 grid grid-cols-2 gap-3 laptop:grid-cols-3 desktop:grid-cols-5 grid-rows-max auto-rows-max overflow-auto',
          {
            'overflow-y-auto': combinable,
            'overflow-hidden': !combinable,
          }
        )}
      >
        {/* TODO: Add wallet faces */}

        {faces.map((face) => (
          <AvatarFaceListItem key={face.resourceUri} meta={face} hideSelected={!combinable} />
        ))}

        {nfts.map((nft) => (
          <AvatarFaceListItem key={nft.resourceUri} meta={nft} hideSelected={!combinable} />
        ))}

        {!combinable && (
          <div className='absolute inset-0 flexColCenter gap-[16px] px-2 text-center bg-dim text-white cursor-not-allowed select-none'>
            <PFInfoOutline width={48} height={48} />
            <Typography type='title2' as='p' overflow='break-words'>
              {t.settings.ec.integrated_body}
            </Typography>
          </div>
        )}
      </div>
    </div>
  );
};

export default AvatarFaceList;
