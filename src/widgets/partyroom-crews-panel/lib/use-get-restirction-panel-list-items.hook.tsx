import { useMemo } from 'react';
import { useLiftPenalty } from '@/features/partyroom/lift-penalty';
import { useFetchMyBlockedCrews } from '@/features/partyroom/list-my-blocked-crews';
import { useFetchCurrentPartyroomPenalties } from '@/features/partyroom/list-penalties';
import { useUnblockCrew } from '@/features/partyroom/unblock-crew';
import { BlockedCrew } from '@/shared/api/http/types/crews';
import { Penalty } from '@/shared/api/http/types/partyrooms';
import { Categorized } from '@/shared/lib/functions/categorize';
import { useStores } from '@/shared/lib/store/stores.context';
import { Button } from '@/shared/ui/components/button';
import * as RestrictionPanelListItem from '../model/restriction-panel-list-item.model';

export default function useGetRestrictionPanelListItems() {
  const partyroomId = useStores().useCurrentPartyroom((state) => state.id);
  if (!partyroomId) {
    throw new Error('partyroomId is not found. maybe you are not in the partyroom.');
  }

  const { data: penalties } = useFetchCurrentPartyroomPenalties();
  const { data: myBlockedCrews = [] } = useFetchMyBlockedCrews();

  const { mutate: liftPenalty } = useLiftPenalty();
  const { mutate: unblockCrew } = useUnblockCrew();

  return useMemo<{
    length: number;
    categorized: Categorized<RestrictionPanelListItem.Model>;
  }>(() => {
    const renderPenaltyLiftButton = (penalty: Penalty) => (
      <Button
        size='xs'
        color='secondary'
        variant='outline'
        onClick={() => liftPenalty({ partyroomId, penaltyId: penalty.penaltyId })}
      >
        Lift{/* TODO: i18n */}
      </Button>
    );
    const renderBlockedCrewLiftButton = (blockedCrew: BlockedCrew) => (
      <Button
        size='xs'
        color='secondary'
        variant='outline'
        onClick={() => unblockCrew({ crewId: blockedCrew.blockedCrewId })}
      >
        Lift{/* TODO: i18n */}
      </Button>
    );

    const list = [
      ...RestrictionPanelListItem.listOfPenalties(penalties, renderPenaltyLiftButton),
      ...RestrictionPanelListItem.listOfMyBlockedCrews(myBlockedCrews, renderBlockedCrewLiftButton),
    ];

    return {
      length: list.length,
      categorized: RestrictionPanelListItem.categorize(list),
    };
  }, [liftPenalty, myBlockedCrews, partyroomId, penalties, unblockCrew]);
}
