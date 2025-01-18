import { useStores } from '@/shared/lib/store/stores.context';

export default function useCrews() {
  return useStores().useCurrentPartyroom((state) => state.crews);
}
