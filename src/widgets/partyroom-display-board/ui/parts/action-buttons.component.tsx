import { useEvaluateCurrentPlayback } from '@/features/partyroom/evaluate-current-playback';
import { useGrabCurrentPlayback } from '@/features/partyroom/grab-current-playback';
import { ReactionType } from '@/shared/api/http/types/@enums';
import { PartyroomReaction } from '@/shared/api/http/types/partyrooms';
import { useStores } from '@/shared/lib/store/stores.context';
import { PFPlaylistAdd, PFThumbDownAlt, PFThumbUpAlt } from '@/shared/ui/icons';
import ActionButton from './action-button.component';

export default function ActionButtons() {
  const { mutate: grabCurrentPlayback } = useGrabCurrentPlayback();
  const { mutate: evaluateCurrentPlayback } = useEvaluateCurrentPlayback();
  const { useCurrentPartyroom } = useStores();
  const reaction = useCurrentPartyroom((state) => state.reaction) ?? emptyReaction;

  return (
    <>
      <ActionButton
        icon={<PFThumbUpAlt width={18} height={18} />}
        text={reaction.aggregation.likeCount}
        active={reaction.history.like}
        activeColor='red'
        onClick={() => evaluateCurrentPlayback(ReactionType.LIKE)}
      />
      <ActionButton
        icon={<PFPlaylistAdd width={18} height={18} />}
        text={reaction.aggregation.grabCount}
        disabled={reaction.history.grab} // NOTE: grab은 끌 수 없음
        active={reaction.history.grab}
        activeColor='green'
        onClick={grabCurrentPlayback}
      />
      <ActionButton
        icon={<PFThumbDownAlt width={18} height={18} />}
        text={reaction.aggregation.dislikeCount}
        active={reaction.history.dislike}
        activeColor='white'
        onClick={() => evaluateCurrentPlayback(ReactionType.DISLIKE)}
      />
    </>
  );
}

const emptyReaction: PartyroomReaction = {
  history: {
    like: false,
    dislike: false,
    grab: false,
  },
  aggregation: {
    likeCount: 0,
    dislikeCount: 0,
    grabCount: 0,
  },
  motion: [],
};
