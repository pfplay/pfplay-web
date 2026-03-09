jest.mock('@/shared/lib/store/stores.context');

import { renderHook } from '@testing-library/react';
import { createCurrentPartyroomStore } from '@/entities/current-partyroom/model/current-partyroom.store';
import { PartyroomEventType } from '@/shared/api/websocket/types/partyroom';
import { useStores } from '@/shared/lib/store/stores.context';
import useReactionAggregationCallback from './use-reaction-aggregation-callback.hook';

let store: ReturnType<typeof createCurrentPartyroomStore>;

beforeEach(() => {
  jest.clearAllMocks();
  store = createCurrentPartyroomStore();
  (useStores as jest.Mock).mockReturnValue({ useCurrentPartyroom: store });
});

describe('useReactionAggregationCallback', () => {
  test('aggregation 값을 이벤트 데이터로 교체한다', () => {
    const { result } = renderHook(() => useReactionAggregationCallback());
    const callback = result.current;

    callback({
      eventType: PartyroomEventType.REACTION_AGGREGATION_UPDATED,
      aggregation: { likeCount: 10, dislikeCount: 3, grabCount: 5 },
    });

    const reaction = store.getState().reaction;
    expect(reaction.aggregation).toEqual({
      likeCount: 10,
      dislikeCount: 3,
      grabCount: 5,
    });
  });

  test('history는 변경되지 않는다', () => {
    // history를 먼저 변경
    store.getState().updateReaction({
      history: { isLiked: true, isDisliked: false, isGrabbed: true },
    });

    const { result } = renderHook(() => useReactionAggregationCallback());
    const callback = result.current;

    callback({
      eventType: PartyroomEventType.REACTION_AGGREGATION_UPDATED,
      aggregation: { likeCount: 99, dislikeCount: 0, grabCount: 0 },
    });

    const reaction = store.getState().reaction;
    expect(reaction.history).toEqual({
      isLiked: true,
      isDisliked: false,
      isGrabbed: true,
    });
    expect(reaction.aggregation).toEqual({
      likeCount: 99,
      dislikeCount: 0,
      grabCount: 0,
    });
  });
});
