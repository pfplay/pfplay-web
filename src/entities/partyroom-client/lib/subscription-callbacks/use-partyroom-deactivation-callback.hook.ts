import { PartyroomDeactivationEvent } from '@/shared/api/websocket/types/partyroom';
import { useStores } from '@/shared/lib/store/stores.context';
import useInvalidateDjingQueue from './utils/use-invalidate-djing-queue.hook';

export default function usePartyroomDeactivationCallback() {
  const { useCurrentPartyroom } = useStores();
  const reset = useCurrentPartyroom((state) => state.reset);
  const invalidateDjingQueue = useInvalidateDjingQueue();

  return (_event: PartyroomDeactivationEvent) => {
    reset();
    invalidateDjingQueue();
  };
}
