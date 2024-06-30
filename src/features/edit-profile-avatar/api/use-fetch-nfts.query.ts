import { useQuery } from '@tanstack/react-query';
import { Alchemy, Network } from 'alchemy-sdk';
import { AxiosError } from 'axios';
import { QueryKeys } from '@/shared/api/react-query/keys';
import { APIError } from '@/shared/api/types/@shared';
import { FIVE_MINUTES, ONE_MINUTE } from '@/shared/config/time';
import withLog from '@/shared/lib/functions/with-log';
import * as Nft from '../model/nft.model';

const alchemy = new Alchemy({
  apiKey: process.env.NEXT_PUBLIC_ALCHEMY_PUBLIC_API_KEY,
  network: Network.ETH_MAINNET,
});

export function useFetchNfts({ isConnected, address }: { isConnected: boolean; address?: string }) {
  return useQuery<Nft.RefinedModel[], AxiosError<APIError>>({
    queryKey: [QueryKeys.Nfts],
    queryFn: async () => {
      const getNfts = withLog(alchemy.nft.getNftsForOwner.bind(alchemy.nft), 'get');
      const { ownedNfts } = await getNfts(address as string);
      return await Nft.refineList(ownedNfts);
    },
    staleTime: ONE_MINUTE,
    gcTime: FIVE_MINUTES,
    enabled: isConnected && !!address,
  });
}
