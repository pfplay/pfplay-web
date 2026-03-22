import { useQueryClient } from '@tanstack/react-query';
import { Nft } from '@/entities/wallet';
import { QueryKeys } from '@/shared/api/http/query-keys';

export default function useIsNft() {
  const queryClient = useQueryClient();
  const nfts = queryClient.getQueryData([QueryKeys.Nfts]) as Nft.Model[];

  return (uri: string) => {
    return nfts && nfts.find((nft) => nft.resourceUri === uri) !== undefined;
  };
}
