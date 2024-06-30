'use client';
import { useEffect, useState } from 'react';
import { Alchemy, Network } from 'alchemy-sdk';
import { useAccount } from 'wagmi';
import withLog from '@/shared/lib/functions/with-log';
import { useDialog } from '@/shared/ui/components/dialog';
import * as Nft from '../model/nft.model';

const alchemy = new Alchemy({
  apiKey: process.env.NEXT_PUBLIC_ALCHEMY_PUBLIC_API_KEY,
  network: Network.ETH_MAINNET,
});

export default function useNfts() {
  const { isConnected, address } = useAccount();
  const { openErrorDialog } = useDialog();

  const [nfts, setNfts] = useState<Nft.RefinedModel[]>([]);

  useEffect(() => {
    if (!isConnected) {
      setNfts([]);
    }
  }, [isConnected]);

  useEffect(() => {
    if (!isConnected || !address) return;

    async function fetchNfts() {
      try {
        const getNftsForOwner = withLog(alchemy.nft.getNftsForOwner.bind(alchemy.nft), 'get');
        const { ownedNfts } = await getNftsForOwner(address as string);
        const refinedNfts = await Nft.refineList(ownedNfts);

        setNfts(refinedNfts);
      } catch (error) {
        // TODO: Reset error message when decision is made
        await openErrorDialog('Error occurred while fetching NFTs.');
      }
    }

    fetchNfts();
  }, [isConnected, address]);

  return nfts;
}
