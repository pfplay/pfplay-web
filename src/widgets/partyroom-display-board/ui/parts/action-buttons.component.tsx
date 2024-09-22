import { useEffect, useRef, useState } from 'react';
import { useEvaluateCurrentPlayback } from '@/features/partyroom/evaluate-current-playback';
import { useGrabCurrentPlayback } from '@/features/partyroom/grab-current-playback';
import { ReactionType } from '@/shared/api/http/types/@enums';
import { Next, update } from '@/shared/lib/functions/update';
import { useIsomorphicLayoutEffect } from '@/shared/lib/hooks/use-isomorphic-layout-effect.hook';
import { useStores } from '@/shared/lib/store/stores.context';
import { PFPlaylistAdd, PFThumbDownAlt, PFThumbUpAlt } from '@/shared/ui/icons';
import ActionButton from './action-button.component';

export default function ActionButtons() {
  const { mutate: grabCurrentPlayback } = useGrabCurrentPlayback();
  const { mutate: evaluateCurrentPlayback } = useEvaluateCurrentPlayback();
  const [reaction, playbackActivated, playback] = useStores().useCurrentPartyroom((state) => [
    state.reaction,
    state.playbackActivated,
    state.playback,
  ]);
  const [flag, updateFlag, resetFlag] = useAggregationFlag({
    initialValue: reaction?.history,
  });

  useEffect(() => {
    /**
     * Current Playback은 과거와 동일한 LinkId를 갖는 Music을 재생하더라도 항상 새로운 인스턴스 취급을 받습니다.
     * 따라서, Playback이 변경될 때마다 Flag는 초기화 되어야 합니다.
     */
    resetFlag();
  }, [playback]);

  return (
    <>
      <ActionButton
        icon={<PFThumbUpAlt width={18} height={18} />}
        text={reaction?.aggregation.likeCount ?? 0}
        disabled={!playbackActivated}
        active={flag.isLiked}
        activeColor='red'
        onClick={() => {
          if (!playbackActivated || flag.isLiked) return;
          evaluateCurrentPlayback(ReactionType.LIKE, {
            onSuccess: () => {
              updateFlag({
                isLiked: true,
                isDisliked: false,
              });
            },
          });
        }}
      />
      <ActionButton
        icon={<PFPlaylistAdd width={18} height={18} />}
        text={reaction?.aggregation.grabCount ?? 0}
        disabled={!playbackActivated || !!reaction?.history.isGrabbed} // NOTE: grab은 끌 수 없음
        active={flag.isGrabbed}
        activeColor='green'
        onClick={() => {
          if (!playbackActivated || flag.isGrabbed) return;
          grabCurrentPlayback(undefined, {
            onSuccess: () => {
              updateFlag({
                isLiked: true,
                isGrabbed: true,
                isDisliked: false,
              });
            },
          });
        }}
      />
      <ActionButton
        icon={<PFThumbDownAlt width={18} height={18} />}
        text={reaction?.aggregation.dislikeCount ?? 0}
        disabled={!playbackActivated}
        active={flag.isDisliked}
        activeColor='white'
        onClick={() => {
          if (!playbackActivated || flag.isDisliked) return;
          evaluateCurrentPlayback(ReactionType.DISLIKE, {
            onSuccess: () => {
              updateFlag({
                isLiked: false,
                isDisliked: true,
              });
            },
          });
        }}
      />
    </>
  );
}

/**
 * history는 setup에서 받아온 뒤 따로 업데이트 이벤트 등이 오지 않기에, local state로 관리해야합니다.
 */
type Flag = {
  isLiked: boolean;
  isDisliked: boolean;
  isGrabbed: boolean;
};
type Props = {
  initialValue: Flag | undefined;
};
function useAggregationFlag({ initialValue }: Props) {
  const entered = useRef(false);
  const [flag, setFlag] = useState<Flag>(defaultFlag);

  const updateFlag = (next: Next<Flag>) => {
    setFlag((prev) => {
      return update(prev, next);
    });
  };

  const resetFlag = () => {
    if (!entered.current) return;

    setFlag(defaultFlag);
  };

  // initialValue가 truthy일 때 "파티룸 입장 완료"로 간주하고 상태를 초기화합니다.
  useIsomorphicLayoutEffect(() => {
    if (!entered.current && initialValue) {
      setFlag(initialValue);
      entered.current = true;
    }
  }, [initialValue]);

  return [flag, updateFlag, resetFlag] as const;
}
const defaultFlag = Object.freeze<Flag>({
  isLiked: false,
  isDisliked: false,
  isGrabbed: false,
});
