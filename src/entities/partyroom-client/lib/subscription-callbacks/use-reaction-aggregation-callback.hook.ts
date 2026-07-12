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

    // 구획 요약용 추적기 counts 동기화 — 스토어 리셋 타이밍과 무관하게 자체 보유 (스펙 §4)
    useCurrentPartyroom.getState().playbackSummaryTracker.updateCounts({
      like: event.aggregation.likeCount,
      dislike: event.aggregation.dislikeCount,
      grab: event.aggregation.grabCount,
    });
  };
}
