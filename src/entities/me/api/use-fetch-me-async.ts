import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { queryOptions } from './use-fetch-me.query';
import * as Me from '../model/me.model';

export function useFetchMeAsync(): () => Promise<Me.Model> {
  const queryClient = useQueryClient();

  return useCallback(() => {
    return queryClient.fetchQuery(queryOptions);
  }, [queryClient]);
}
