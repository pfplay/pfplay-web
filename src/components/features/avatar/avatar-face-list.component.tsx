'use client';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { NFTService } from '@/api/services/nft';
import { FetchStatus } from '@/api/types/@shared';
import { AvatarParts } from '@/api/types/avatar';
import { OwnedNft } from '@/api/types/nft';
import { useDialog } from '@/shared/ui/components/dialog/use-dialog.hook';
import AvatarListItem from './avatar-list-item.component';
import ConnectWalletButton from './connect-wallet-button.component';

const AvatarFaceList = () => {
  const { isConnected, address } = useAccount();
  const { openErrorDialog } = useDialog();

  const [apiStatus, setApiStatus] = useState<FetchStatus>('idle');
  const [nfts, setNfts] = useState<AvatarParts[]>([]);

  useEffect(() => {
    if (!isConnected) {
      setApiStatus('idle');
      setNfts([]);
    }
  }, [isConnected, setNfts, setApiStatus]);

  useEffect(() => {
    if (apiStatus === 'idle' && isConnected && address) {
      (async () => {
        setApiStatus('loading');

        try {
          const { ownedNfts } = await NFTService.getNFTs(address);
          const refinedNfts = await refineNftData(ownedNfts);

          setNfts(refinedNfts);
          setApiStatus('succeeded');
        } catch (error) {
          setApiStatus('failed');
          // TODO: Reset error message when decision is made
          await openErrorDialog('Error occurred while fetching NFTs.');
        }
      })();
    }
  }, [apiStatus, isConnected, address, openErrorDialog]);

  // TODO: Replace with the loading component
  if (apiStatus === 'loading') return <div>로딩중...</div>;

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

export const refineNftData = async (nfts: OwnedNft[]): Promise<AvatarParts[]> => {
  const thumbnailExistNfts = nfts.filter((nft) => !!nft.image?.thumbnailUrl);

  const results = await Promise.allSettled(requestImageUrlHealthCheck(thumbnailExistNfts));

  const refined: OwnedNft[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled' && result.value !== null) {
      refined.push(result.value);
    }
  }

  return refined.map((nft) => {
    return {
      id: crypto.randomUUID(), //NOTE: Response의 OwnedNft에서 unique한 아이디가 없어서 crypto module 사용
      image: nft.image.thumbnailUrl as string,
      name: nft.name,
    };
  });
};

const requestImageUrlHealthCheck = (thumbnailExistNfts: OwnedNft[]) =>
  thumbnailExistNfts.map(async (nft) => {
    try {
      const res = await NFTService.checkImageUrlStatus(nft.image?.thumbnailUrl as string);
      return res.status === 200 ? nft : null;
    } catch (error) {
      return null;
    }
  });
