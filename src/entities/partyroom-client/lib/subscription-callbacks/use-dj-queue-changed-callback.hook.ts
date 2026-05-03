import { useQueryClient } from '@tanstack/react-query';
import { QueryKeys } from '@/shared/api/http/query-keys';
import { DjingQueue } from '@/shared/api/http/types/partyrooms';
import { DjQueueChangedEvent } from '@/shared/api/websocket/types/partyroom';
import { trackDjAdminDeregisterDetected } from '@/shared/lib/analytics/room-tracking';
import { useStores } from '@/shared/lib/store/stores.context';

export default function useDjQueueChangedCallback() {
  const queryClient = useQueryClient();
  const { useCurrentPartyroom } = useStores();
  const updateCurrentDj = useCurrentPartyroom((state) => state.updateCurrentDj);

  return (event: DjQueueChangedEvent) => {
    const queryKey = [QueryKeys.DjingQueue, event.partyroomId];

    // self 가 큐에서 빠졌는지 검출 — 본인이 unregister 하지 않았는데 사라졌다면
    // admin 강제 해제로 분류. trackDjAdminDeregisterDetected 내부에서 직전
    // self mutation 의 suppression 윈도우를 확인.
    const prev = queryClient.getQueryData<DjingQueue>(queryKey);
    const myCrewId = useCurrentPartyroom.getState().me?.crewId;
    if (prev && myCrewId !== undefined) {
      const wasInQueue = prev.djs.some((d) => d.crewId === myCrewId);
      const stillInQueue = event.djs.some((d) => d.crewId === myCrewId);
      if (wasInQueue && !stillInQueue) {
        trackDjAdminDeregisterDetected(event.partyroomId);
      }
    }

    const currentDj = event.djs.slice().sort((a, b) => a.orderNumber - b.orderNumber)[0];

    updateCurrentDj(currentDj ? { crewId: currentDj.crewId } : undefined);
    queryClient.setQueryData<DjingQueue>(queryKey, (prev) => {
      if (!prev) {
        queryClient.invalidateQueries({ queryKey });
        return prev;
      }

      return { ...prev, djs: event.djs };
    });
  };
}
