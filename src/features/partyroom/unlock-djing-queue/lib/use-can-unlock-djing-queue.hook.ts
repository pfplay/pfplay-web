import { Crew } from '@/entities/current-partyroom';
import { useStores } from '@/shared/lib/store/stores.context';

export default function useCanUnlockDjingQueue(): boolean {
  const me = useStores().useCurrentPartyroom((state) => state.me);

  return (() => {
    if (!me) return false;

    const permissions = Crew.Permission.of(me.gradeType);
    const canLockDjingQueue = permissions?.canUnlockDjingQueue();

    return !!canLockDjingQueue;
  })();
}
