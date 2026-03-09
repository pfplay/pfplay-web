import { ReactionAggregationUpdatedEvent } from '@/shared/api/websocket/types/partyroom';
import { useStores } from '@/shared/lib/store/stores.context';

export default function useReactionAggregationCallback() {
  const { useCurrentPartyroom } = useStores();
  const updateReaction = useCurrentPartyroom((state) => state.updateReaction);

  return (event: ReactionAggregationUpdatedEvent) => {
    updateReaction((prev) => ({
      ...prev,
      aggregation: event.aggregation,
    }));
  };
}
