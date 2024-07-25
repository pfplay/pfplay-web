import { useCallback } from 'react';
import { AggregationEvent } from '@/shared/api/websocket/types/partyroom';

export default function useAggregationCallback() {
  return useCallback((event: AggregationEvent) => {
    console.log('AggregationEvent:', event);
  }, []);
}
