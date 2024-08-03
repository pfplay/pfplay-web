import { useCallback } from 'react';
import { DeactivationEvent } from '@/shared/api/websocket/types/partyroom';
import { useStores } from '@/shared/lib/store/stores.context';

export default function useDeactivationCallback() {
  const { useCurrentPartyroom } = useStores();
  const reset = useCurrentPartyroom((state) => state.reset);

  return useCallback(
    (_event: DeactivationEvent) => {
      reset();
    },
    [reset]
  );
}
