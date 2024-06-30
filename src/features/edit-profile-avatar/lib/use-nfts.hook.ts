'use client';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { NFTService } from '@/shared/api/services/nft';
import { FetchStatus } from '@/shared/api/types/@shared';
import { useDialog } from '@/shared/ui/components/dialog';
import * as Nft from '../model/nft.model';

export default function useNfts() {
  const { isConnected, address } = useAccount();
  const { openErrorDialog } = useDialog();

  const [fetchStatus, setFetchStatus] = useState(FetchStatus.Idle);
  const [nfts, setNfts] = useState<Nft.RefinedModel[]>([]);

  useEffect(() => {
    if (!isConnected) {
      setFetchStatus(FetchStatus.Idle);
      setNfts([]);
    }
  }, [isConnected]);

  useEffect(() => {
    if (isConnected && fetchStatus === FetchStatus.Idle && address) {
      (async function fetchNfts() {
        setFetchStatus(FetchStatus.Loading);

        try {
          const { ownedNfts } = await NFTService.getNFTs(address);
          const refinedNfts = await Nft.refineList(ownedNfts);

          setNfts(refinedNfts);
          setFetchStatus(FetchStatus.Succeeded);
        } catch (error) {
          setFetchStatus(FetchStatus.Failed);
          // TODO: Reset error message when decision is made
          await openErrorDialog('Error occurred while fetching NFTs.');
        }
      })();
    }
  }, [isConnected, fetchStatus, address]);

  return {
    nfts,
    status: fetchStatus,
  };
}
