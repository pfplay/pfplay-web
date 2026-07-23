import { useEffect, useRef } from 'react';
import { IMessage } from '@stomp/stompjs';
import { useRemoveCurrentPartyroomCaches } from '@/entities/current-partyroom';
import { SessionEventType, SessionSupersededEvent } from '@/shared/api/websocket/types/session';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useAppRouter } from '@/shared/lib/router/use-app-router.hook';
import { useStores } from '@/shared/lib/store/stores.context';
import { useDialog } from '@/shared/ui/components/dialog';
import { usePartyroomClient } from './partyroom-client.context';

/**
 * 멀티 디바이스 세션 승계 수신측(#476). 유저 개인 큐(/user/sub/session)를 구독해
 * SESSION_SUPERSEDED 를 받으면, 이 세션(탭)이 보고 있는 방이 밀려난 방과 일치할 때
 * 로컬 teardown 후 로비로 이동하고 안내 모달을 띄운다.
 *
 * <p>서버가 이미 밀어냄(crew EXIT)을 완결했으므로 **exit API 를 호출하지 않는다**(서버 권위 원칙).
 * WS 가 죽어 알림을 못 받아도 무방하다 — 재연결 resync 스냅샷(#477)이 정합성을 치유한다.
 * 같은 유저의 새 세션 B 는 newPartyroomId 에 있어 supersededPartyroomId 와 불일치하므로 무시된다.
 */
export function useSupersededSessionListener() {
  const client = usePartyroomClient();
  const { useCurrentPartyroom } = useStores();
  const reset = useCurrentPartyroom((state) => state.reset);
  const removeCurrentPartyroomCaches = useRemoveCurrentPartyroomCaches();
  const router = useAppRouter();
  const { openAlertDialog } = useDialog();
  const t = useI18n();

  const handlerRef = useRef<(message: IMessage) => void>(() => {});
  handlerRef.current = (message: IMessage) => {
    let event: SessionSupersededEvent | undefined;
    try {
      event = JSON.parse(message.body);
    } catch {
      return;
    }
    if (event?.type !== SessionEventType.SESSION_SUPERSEDED) return;

    // 이 세션(탭)이 보고 있는 방이 밀려난 방일 때만 처리한다.
    const currentRoomId = useCurrentPartyroom.getState().id;
    if (currentRoomId == null || currentRoomId !== event.supersededPartyroomId) return;

    // 로컬 teardown 만 수행 — 서버가 이미 EXIT 완결했으므로 exit API 미호출.
    client.unsubscribeCurrentRoom();
    reset();
    removeCurrentPartyroomCaches();
    router.push('/parties');
    openAlertDialog({ content: t.party.para.superseded });
  };

  useEffect(() => {
    const handler = (message: IMessage) => handlerRef.current(message);
    client.subscribeUserSession(handler);
    return () => client.unsubscribeUserSession();
  }, [client]);
}
