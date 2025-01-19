import { useMemo } from 'react';
import { useFetchMyBlocks } from '@/features/partyroom/list-my-blocks';
import { useFetchCurrentPartyroomPenalties } from '@/features/partyroom/list-penalties';
import { Categorized } from '@/shared/lib/functions/categorize';
import * as RestrictionPanelListItem from '../model/restriction-panel-list-item.model';

export default function useGetRestrictionPanelListItems() {
  const { data: penalties } = useFetchCurrentPartyroomPenalties();
  const { data: myBlocks = [] } = useFetchMyBlocks();

  return useMemo<{
    length: number;
    categorized: Categorized<RestrictionPanelListItem.Model>;
  }>(() => {
    const list = [
      ...RestrictionPanelListItem.listOfPenalties(penalties),
      ...RestrictionPanelListItem.listOfMyBlockedCrews(myBlocks),
    ];

    return {
      length: list.length,
      categorized: RestrictionPanelListItem.categorize(list),
    };
  }, [myBlocks, penalties]);
}
