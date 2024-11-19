import { usePartyroomClient } from '@/entities/partyroom-client';
import { useStores } from '@/shared/lib/store/stores.context';
import { useExitPartyroom as useExitPartyroomMutation } from '../api/use-exit-partyroom.mutation';

export function useExitPartyroom(partyroomId: number) {
  const client = usePartyroomClient();
  const { useCurrentPartyroom } = useStores();
  const [resetPartyroomStore] = useCurrentPartyroom((state) => [state.reset]);
  const { mutate: exit } = useExitPartyroomMutation();

  return () => {
    const { exitedOnBackend } = useCurrentPartyroom.getState();
    if (!exitedOnBackend) {
      exit({ partyroomId });
    }

    client.unsubscribeCurrentRoom();
    resetPartyroomStore(); // NOTE: exitedOnBackend 플래그 체크 이전에 호출되면 안됩니다.
  };
}
