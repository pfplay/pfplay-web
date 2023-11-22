'use client';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { FetchStatus } from '@/api/@types/@shared';
import { AvatarParts } from '@/api/@types/Avatar';
import { Asset } from '@/api/@types/NFT';
import { NFTService } from '@/api/services/NFT';
import { useDialog } from '@/hooks/useDialog';
import AvatarListItem from './AvatarListItem';
import ConnectWalletButton from './ConnectWalletButton';

const AvatarFaceList = () => {
  const { isConnected, address } = useAccount();
  const { openErrorDialog } = useDialog();

  const [apiStatus, setApiStatus] = useState<FetchStatus>('idle');
  const [nfts, setNfts] = useState<AvatarParts[]>([]);

  useEffect(() => {
    if (apiStatus === 'idle' && isConnected && address) {
      (async () => {
        setApiStatus('loading');
        try {
          const data = await NFTService.getNFTs('0xa4d1D0060eAd119cdF04b7C797A061400C6Ba8a7');

          setNfts(refineNftData(data.assets));
          setApiStatus('succeeded');
        } catch (error) {
          setApiStatus('failed');
          await openErrorDialog('Error occurred while fetching NFTs.'); // TODO: Reset error message when decision is made
        }
      })();
    }
  }, [apiStatus, isConnected, address, openErrorDialog]);

  return (
    <div className='flexCol gap-4'>
      <div className='flexRow justify-end items-center gap-3'>
        <ConnectWalletButton />
      </div>
      <div className='max-h-[416px] grid grid-cols-2 gap-3 laptop:grid-cols-3 desktop:grid-cols-5  overflow-y-auto styled-scroll'>
        {apiStatus === 'succeeded' &&
          nfts.map(({ id, image, name }) => (
            <AvatarListItem
              key={id}
              avatar={{
                id,
                image,
                name,
              }}
              from='face'
            />
          ))}
      </div>
    </div>
  );
};

export default AvatarFaceList;

export const refineNftData = (nfts: Asset[]): AvatarParts[] => {
  return nfts.map((nft) => {
    return {
      id: nft.id,
      image: nft.image_thumbnail_url,
      name: nft.name,
    };
  });
};
