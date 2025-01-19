import { useMemo } from 'react';
import { useFetchMyBlocks } from '@/features/partyroom/list-my-blocks';
import { useFetchCurrentPartyroomPenalties } from '@/features/partyroom/list-penalties';
import { Categorized } from '@/shared/lib/functions/categorize';
import { useStores } from '@/shared/lib/store/stores.context';
import * as RestrictionPanelListItem from '../model/restriction-panel-list-item.model';

export default function useGetRestrictionPanelListItems() {
  const crews = useStores().useCurrentPartyroom((state) => state.crews);
  const { data: penalties } = useFetchCurrentPartyroomPenalties();
  const { data: myBlocks = [] } = useFetchMyBlocks();

  return useMemo<{
    length: number;
    categorized: Categorized<RestrictionPanelListItem.Model>;
  }>(() => {
    const list = [
      ...RestrictionPanelListItem.listOfPenalty(penalties, crews),
      ...RestrictionPanelListItem.listOfMyBlockedCrews(myBlocks, crews),
    ];

    return {
      length: list.length,
      categorized: RestrictionPanelListItem.categorize(list),
    };
  }, [crews, myBlocks, penalties]);
}
