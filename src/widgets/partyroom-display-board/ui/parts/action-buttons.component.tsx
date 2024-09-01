import { useEffect, useRef, useState } from 'react';
import { useEvaluateCurrentPlayback } from '@/features/partyroom/evaluate-current-playback';
import { useGrabCurrentPlayback } from '@/features/partyroom/grab-current-playback';
import { ReactionType } from '@/shared/api/http/types/@enums';
import { PartyroomReaction } from '@/shared/api/http/types/partyrooms';
import { Next, update } from '@/shared/lib/functions/update';
import { useStores } from '@/shared/lib/store/stores.context';
import { PFPlaylistAdd, PFThumbDownAlt, PFThumbUpAlt } from '@/shared/ui/icons';
import ActionButton from './action-button.component';

export default function ActionButtons() {
  const { mutate: grabCurrentPlayback } = useGrabCurrentPlayback();
  const { mutate: evaluateCurrentPlayback } = useEvaluateCurrentPlayback();
  const [reaction, playbackActivated] = useStores().useCurrentPartyroom((state) => [
    state.reaction,
    state.playbackActivated,
  ]);
  const [activeState, updateActiveState] = useActiveState(reaction?.history);

  return (
    <>
      <ActionButton
        icon={<PFThumbUpAlt width={18} height={18} />}
        text={reaction?.aggregation.likeCount ?? 0}
        disabled={!playbackActivated}
        active={activeState.like}
        activeColor='red'
        onClick={() => {
          if (!playbackActivated || activeState.like) return;
          evaluateCurrentPlayback(ReactionType.LIKE, {
            onSuccess: () => {
              updateActiveState({
                like: true,
                dislike: false,
              });
            },
          });
        }}
      />
      <ActionButton
        icon={<PFPlaylistAdd width={18} height={18} />}
        text={reaction?.aggregation.grabCount ?? 0}
        disabled={!playbackActivated || !!reaction?.history.grab} // NOTE: grab은 끌 수 없음
        active={activeState.grab}
        activeColor='green'
        onClick={() => {
          if (!playbackActivated || activeState.grab) return;
          grabCurrentPlayback(undefined, {
            onSuccess: () => {
              updateActiveState({
                like: true,
                grab: true,
                dislike: false,
              });
            },
          });
        }}
      />
      <ActionButton
        icon={<PFThumbDownAlt width={18} height={18} />}
        text={reaction?.aggregation.dislikeCount ?? 0}
        disabled={!playbackActivated}
        active={activeState.dislike}
        activeColor='white'
        onClick={() => {
          if (!playbackActivated || activeState.dislike) return;
          evaluateCurrentPlayback(ReactionType.DISLIKE, {
            onSuccess: () => {
              updateActiveState({
                like: false,
                dislike: true,
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
function useActiveState(history?: PartyroomReaction['history']) {
  const initialized = useRef(!!history);
  const [activeState, setActiveState] = useState(
    history ?? {
      like: false,
      dislike: false,
      grab: false,
    }
  );

  const updateActiveState = (next: Next<PartyroomReaction['history']>) => {
    setActiveState((prev) => {
      return update(prev, next);
    });
  };

  useEffect(() => {
    if (!initialized.current && history) {
      setActiveState(history);
      initialized.current = true;
    }
  }, [history]);

  return [activeState, updateActiveState] as const;
}
