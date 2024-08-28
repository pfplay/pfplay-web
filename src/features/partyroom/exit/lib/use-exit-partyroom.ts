import { usePartyroomClient } from '@/entities/partyroom-client';
import PartyroomsService from '@/shared/api/http/services/partyrooms';
import { useStores } from '@/shared/lib/store/stores.context';
import { useExitPartyroom as useExitPartyroomMutation } from '../api/use-exit-partyroom.mutation';

export function useExitPartyroom(partyroomId: number) {
  const client = usePartyroomClient();
  const { useCurrentPartyroom } = useStores();
  const resetPartyroomStore = useCurrentPartyroom((state) => state.reset);
  const { mutate: exit } = useExitPartyroomMutation();

  return {
    exit: () => {
      exit(
        { partyroomId },
        {
          onSuccess: () => {
            client.unsubscribeCurrentRoom();
            resetPartyroomStore();
          },
        }
      );
    },
    /**
     * 페이지 이탈 시에 사용
     * (페이지 이탈 시엔 쿼리 캐시 제거, 소켓 구독 해제 등의 후처리 동작이 필요 없음)
     */
    onBeforeUnload: () => {
      try {
        return PartyroomsService.exit({ partyroomId });
      } catch {
        /* Do nothing */
      }
    },
  };
}
