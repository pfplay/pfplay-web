'use client';

import { useCallback, useEffect } from 'react';
import { usePartyroomClient } from '@/entities/partyroom-client';
import { partyroomsService } from '@/shared/api/http/services';
import silent from '@/shared/lib/functions/silent';
import { useStores } from '@/shared/lib/store/stores.context';

/**
 * 재연결 / 백그라운드 탭 복귀 시 서버의 현재 재생상태를 다시 조회해 스토어에 주입한다(이슈 #335).
 *
 * `PLAYBACK_STARTED` 등 fire-and-forget broadcast 는 연결이 끊겼거나 백그라운드 throttling 으로
 * 놓친 구간에 발행되면 ack/replay 가 없어 영구 유실된다. 백그라운드 실시간 100% 수신은 cross-browser
 * 로 보장 불가하므로, "복귀 시점에 self-heal" 하는 안전망으로 해결한다.
 *
 * - **reconnect**: `client.onReconnect`(최초 connect 제외)마다 재조회. 끊겼다 다시 붙은 경우.
 * - **visibilitychange(hidden→visible)**: 연결이 유지된 채(예: half-open) 이벤트만 놓친 경우도 보정.
 *
 * 재생상태(playback / playbackActivated / currentDj)만 갱신한다 — 입장(enter)은 재호출하지 않으며,
 * 구독 자체는 SocketClient 가 reconnect 시 `subscriptions[]` 기준으로 자체 reconcile 한다.
 */
export function usePlaybackResync(partyroomId: number) {
  const client = usePartyroomClient();
  const { useCurrentPartyroom } = useStores();
  const [updatePlaybackActivated, updatePlayback, updateCurrentDj] = useCurrentPartyroom(
    (state) => [state.updatePlaybackActivated, state.updatePlayback, state.updateCurrentDj]
  );

  const resync = useCallback(async () => {
    const { display } = await partyroomsService.getSetupInfo({ partyroomId });
    updatePlaybackActivated(display.playbackActivated);
    updatePlayback(display.playback);
    updateCurrentDj(display.currentDj);
  }, [partyroomId, updatePlaybackActivated, updatePlayback, updateCurrentDj]);

  useEffect(() => {
    const run = () => void silent(resync());

    const unregisterReconnect = client.onReconnect(run);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') run();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      unregisterReconnect();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [client, resync]);
}
