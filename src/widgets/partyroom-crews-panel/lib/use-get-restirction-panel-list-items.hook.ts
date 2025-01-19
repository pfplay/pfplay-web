import { useMemo } from 'react';
import { useFetchMyBlockedCrews } from '@/features/partyroom/list-my-blocked-crews';
import { useFetchCurrentPartyroomPenalties } from '@/features/partyroom/list-penalties';
import { Categorized } from '@/shared/lib/functions/categorize';
import * as RestrictionPanelListItem from '../model/restriction-panel-list-item.model';

export default function useGetRestrictionPanelListItems() {
  const { data: penalties } = useFetchCurrentPartyroomPenalties();
  const { data: myBlockedCrews = [] } = useFetchMyBlockedCrews();

  return useMemo<{
    length: number;
    categorized: Categorized<RestrictionPanelListItem.Model>;
  }>(() => {
    const list = [
      ...RestrictionPanelListItem.listOfPenalties(penalties),
      ...RestrictionPanelListItem.listOfMyBlockedCrews(myBlockedCrews),
    ];

    return {
      length: list.length,
      categorized: RestrictionPanelListItem.categorize(list),
    };
  }, [myBlockedCrews, penalties]);
}
