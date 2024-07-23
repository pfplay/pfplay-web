import { AggregationEvent } from '@/shared/api/websocket/types/partyroom';

export default function aggregationCallback(event: AggregationEvent) {
  console.log('aggregationCallback', event);
}
