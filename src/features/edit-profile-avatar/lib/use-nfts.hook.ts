'use client';
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { QueryKeys } from '@/shared/api/react-query/keys';
import { useFetchNfts } from '../api/use-fetch-nfts.query';

export default function useNfts() {
  const queryClient = useQueryClient();
  const { isConnected, address } = useAccount();
  const { data: nfts = [] } = useFetchNfts({ isConnected, address });

  useEffect(() => {
    if (!isConnected) {
      queryClient.removeQueries({
        queryKey: [QueryKeys.Nfts],
      });
    }
  }, [isConnected]);

  return nfts;
}
