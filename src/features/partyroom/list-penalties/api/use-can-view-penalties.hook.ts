import { Crew } from '@/entities/current-partyroom';
import { useStores } from '@/shared/lib/store/stores.context';

export default function canViewPenalties() {
  const me = useStores().useCurrentPartyroom((state) => state.me);

  return (() => {
    if (!me) return false;

    const myPermission = Crew.Permission.of(me.gradeType);

    return myPermission.canViewPenalties();
  })();
}
