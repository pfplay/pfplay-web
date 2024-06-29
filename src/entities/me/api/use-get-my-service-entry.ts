import { useCallback } from 'react';
import { useFetchMeAsync } from '@/entities/me';
import * as Me from '../model/me.model';

export function useGetMyServiceEntry(): () => Promise<string> {
  const fetchMeAsync = useFetchMeAsync();

  return useCallback(async () => {
    try {
      const me = await fetchMeAsync();
      return Me.serviceEntry(me);
    } catch {
      return Me.serviceEntry(null); // maybe 401
    }
  }, [fetchMeAsync]);
}
