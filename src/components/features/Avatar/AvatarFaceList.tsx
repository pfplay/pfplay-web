'use client';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { FetchStatus } from '@/api/@types/@shared';
import { AvatarParts } from '@/api/@types/Avatar';
import { Asset } from '@/api/@types/NFT';
import { NFTService } from '@/api/services/NFT';
import AvatarListItem from './AvatarListItem';
import ConnectWalletButton from './ConnectWalletButton';

// export const refineNftData = (nfts: OwnedNfts[]): AvatarParts[] => {
//   return nfts
//     .filter((nft) => !!nft.media[0].format && nft.media[0].format !== 'mp4')
//     .map((nft) => {
//       return {
//         id: nft.metadata.name,
//         image: nft.media[0].thumbnail,
//         name: nft.metadata.name,
//       };
//     });
// };
export const refineNftData = (nfts: Asset[]): AvatarParts[] => {
  return nfts.map((nft) => {
    return {
      id: nft.id,
      image: nft.image_thumbnail_url,
      name: nft.name,
    };
  });
};

const AvatarFaceList = () => {
  const { isConnected, address } = useAccount();

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
          // TODO: Replace with Error Modal
          setApiStatus('failed');
        }
      })();
    }
  }, [apiStatus, isConnected, address]);

  console.log({ nft: nfts.length });

  return (
    <div className='flexCol gap-4'>
      <div className='flexRow justify-end items-center gap-3'>
        <ConnectWalletButton />
      </div>
      <div className='max-h-[416px] grid grid-cols-2 gap-3 laptop:grid-cols-3 desktop:grid-cols-5  overflow-y-auto styled-scroll'>
        {nfts.map(({ id, image, name }) => (
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
