import { PartyroomReaction } from '@/shared/api/http/types/partyrooms';
import { useStores } from '@/shared/lib/store/stores.context';
import { PFPlaylistAdd, PFThumbDownAlt, PFThumbUpAlt } from '@/shared/ui/icons';
import ActionButton from './action-button.component';

export default function ActionButtons() {
  const { useCurrentPartyroom } = useStores();
  const reaction = useCurrentPartyroom((state) => state.reaction) ?? emptyReaction;

  return (
    <>
      <ActionButton
        icon={<PFThumbUpAlt width={18} height={18} />}
        text={reaction.aggregation.likeCount}
        active={reaction.history.like}
        activeColor='red'
      />
      <ActionButton
        icon={<PFPlaylistAdd width={18} height={18} />}
        text={reaction.aggregation.grabCount}
        active={reaction.history.grab}
        activeColor='green'
      />
      <ActionButton
        icon={<PFThumbDownAlt width={18} height={18} />}
        text={reaction.aggregation.dislikeCount}
        active={reaction.history.dislike}
        activeColor='white'
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
