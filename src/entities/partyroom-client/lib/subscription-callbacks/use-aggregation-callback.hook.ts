import { useCallback } from 'react';
import { AggregationEvent } from '@/shared/api/websocket/types/partyroom';
import { useStores } from '@/shared/lib/store/stores.context';

export default function useAggregationCallback() {
  const { useCurrentPartyroom } = useStores();
  const updateReaction = useCurrentPartyroom((state) => state.updateReaction);

  return useCallback(
    (event: AggregationEvent) => {
      updateReaction((prev) => {
        if (!prev) return;

        return {
          ...prev,
          aggregation: event.aggregation,
        };
      });
    },
    [updateReaction]
  );
}
