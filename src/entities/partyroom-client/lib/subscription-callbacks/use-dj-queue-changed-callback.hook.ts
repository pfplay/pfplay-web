import { useQueryClient } from '@tanstack/react-query';
import { QueryKeys } from '@/shared/api/http/query-keys';
import { DjingQueue } from '@/shared/api/http/types/partyrooms';
import { DjQueueChangedEvent } from '@/shared/api/websocket/types/partyroom';
import { trackDjAdminDeregisterDetected } from '@/shared/lib/analytics/room-tracking';
import { useStores } from '@/shared/lib/store/stores.context';
import { appendSummaryToChat } from './emit-playback-summary';

export default function useDjQueueChangedCallback() {
  const queryClient = useQueryClient();
  const { useCurrentPartyroom } = useStores();
  const [updateCurrentDj, alert] = useCurrentPartyroom((s) => [s.updateCurrentDj, s.alert]);

  return (event: DjQueueChangedEvent) => {
    // DEACTIVATE = 재생 경계 — 구획 방출 (추적기가 hold-and-clear라
    // 같은 비활성화의 PLAYBACK_DEACTIVATED와 둘 다 도착해도 구획은 1회)
    if (event.changeType === 'DEACTIVATE') {
      const { playbackSummaryTracker, appendChatMessage } = useCurrentPartyroom.getState();
      appendSummaryToChat(playbackSummaryTracker.flushBoundary(Date.now()), appendChatMessage);
    }

    const queryKey = [QueryKeys.DjingQueue, event.partyroomId];

    // self 가 큐에서 빠졌는지 검출 — changeType별로 분기하여
    // alert 안내 및 tracking 처리.
    const prev = queryClient.getQueryData<DjingQueue>(queryKey);
    const myCrewId = useCurrentPartyroom.getState().me?.crewId;
    if (prev && myCrewId !== undefined) {
      const wasInQueue = prev.djs.some((d) => d.crewId === myCrewId);
      const stillInQueue = event.djs.some((d) => d.crewId === myCrewId);
      if (wasInQueue && !stillInQueue) {
        const ct = event.changeType;
        if (ct === 'DEQUEUE_EXIT') {
          // 본인 이탈 → silent
        } else if (ct === 'DEACTIVATE') {
          alert.notify({
            type: 'dj-deactivated',
            playbackTimeLimitMinutes: event.playbackTimeLimitMinutes ?? null,
          });
          trackDjAdminDeregisterDetected(event.partyroomId, ct);
        } else if (ct === 'DEQUEUE_ADMIN') {
          alert.notify({ type: 'dj-admin-removed' });
          trackDjAdminDeregisterDetected(event.partyroomId, ct);
        } else {
          trackDjAdminDeregisterDetected(event.partyroomId, ct); // 구 메시지 등 → 분류만(안내 없음)
        }
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
