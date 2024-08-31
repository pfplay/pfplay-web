import { usePartyroomClient } from '@/entities/partyroom-client';
import { useStores } from '@/shared/lib/store/stores.context';
import { useExitPartyroom as useExitPartyroomMutation } from '../api/use-exit-partyroom.mutation';

export function useExitPartyroom(partyroomId: number) {
  const client = usePartyroomClient();
  const { useCurrentPartyroom } = useStores();
  const resetPartyroomStore = useCurrentPartyroom((state) => state.reset);
  const { mutate: exit } = useExitPartyroomMutation();

  return () => {
    exit({ partyroomId });

    // NOTE: mutation을 들고 있는 컴포넌트가 언마운트 되면 onSuccess가 실행되지 않으므로,
    // 이하 로직을 exit의 onSuccess에 넣으면 안됩니다
    client.unsubscribeCurrentRoom();
    resetPartyroomStore();
  };
}
