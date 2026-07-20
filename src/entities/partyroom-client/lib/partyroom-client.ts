import { IMessage } from '@stomp/stompjs';
import SocketClient, { OnConnectOptions } from '@/shared/api/websocket/client';
import { recordClientEvent } from '@/shared/lib/observability/client-events';

/**
 * Socket Client를 캡슐화하여 최소한의 인터페이스만을 노출하며,
 * partyroom 구독에 대한 정책을 포함하는 클래스
 */
export default class PartyroomClient {
  private socketClient: SocketClient;
  private subscribedRoomId: number | undefined;
  // #469 현재 방의 "재연결 시 재입장(resync)" 핸들러 해제자. 단일 슬롯 — 방 전환 시 교체되고
  // unsubscribeCurrentRoom(teardown 경로)에서 정리되므로 방마다 핸들러가 누적되지 않는다.
  private roomReconnectDisposer: (() => void) | undefined;

  public constructor() {
    this.socketClient = new SocketClient();
    this.syncE2EDebugState();
  }

  public connect() {
    this.socketClient.connect();
    this.syncE2EDebugState();
  }

  public get connected() {
    return this.socketClient.connected;
  }

  public onConnect(callback: () => void, options?: OnConnectOptions) {
    return this.socketClient.onConnect(callback, options);
  }

  /**
   * #469 현재 방의 재연결 resync 핸들러를 단일 슬롯으로 등록한다. 이전 방의 핸들러는 교체(해제)되고,
   * teardown 이 호출하는 {@link unsubscribeCurrentRoom} 에서 함께 정리되므로 `onConnectQueue` 에
   * 방마다 핸들러가 누적되지 않는다 — 구독의 "destination당 1개 replace" 정책과 동일한 단일-방 생명주기.
   */
  public setRoomReconnectHandler(callback: () => void) {
    this.roomReconnectDisposer?.();
    // skipCurrent: 등록 시점의 연결엔 미발화(초기 enter 담당) → 이후 재연결에만 resync.
    this.roomReconnectDisposer = this.socketClient.onConnect(callback, { skipCurrent: true });
  }

  /**
   * partyroom 을 구독합니다. **replace 정책**:
   * 이미 다른 방을 구독 중이면 기존 방을 먼저 해지한 뒤 새 방을 구독합니다 (throw 없음).
   *
   * - 과거의 "다중 구독 시 throw" 가드는 #30 (throw → silent → router.push → unmount → 강제 퇴장)
   *   증폭의 발원지였으므로 제거되었습니다. 동기적 unsubscribe-then-subscribe 로 대체합니다.
   * - 동시에 이는 SocketClient.subscriptions[] (T3.1 단일 진실원천)의
   *   "destination 당 활성 구독 1개" 전제를 소비자 계층에서 강제합니다.
   * - 동일 방으로의 재구독은 idempotent — 중복 SoT 엔트리를 만들지 않기 위해 no-op 합니다.
   *   이때 새로 전달된 handler 는 의도적으로 무시됩니다 (이미 구독 중인 방에 대해 다른 handler 로
   *   재구독해도 교체되지 않는 no-op 이므로, 향후 두 번째 호출자는 이 점에 유의해야 합니다).
   */
  public subscribe(partyroomId: number, handler: (message: IMessage) => void) {
    if (this.subscribedRoomId === partyroomId) {
      // 동일 destination 재구독은 T3.1 단일 destination 전제를 위반(중복 SoT 엔트리)하므로 no-op.
      return;
    }

    if (this.subscribedRoomId != null) {
      recordClientEvent({
        type: 'PARTYROOM_SUBSCRIBE_REPLACED',
        fromPartyroomId: this.subscribedRoomId,
        toPartyroomId: partyroomId,
      });
      this.unsubscribeCurrentRoom();
    }

    this.socketClient.subscribe(`/sub/partyrooms/${partyroomId}`, handler);
    this.subscribedRoomId = partyroomId;
    recordClientEvent({ type: 'PARTYROOM_SUBSCRIBE', partyroomId });
    this.syncE2EDebugState();
  }

  public unsubscribeCurrentRoom() {
    const roomId = this.subscribedRoomId;
    this.socketClient.unsubscribe(`/sub/partyrooms/${roomId}`);
    this.subscribedRoomId = undefined;
    // #469 재연결 resync 핸들러도 구독과 함께 정리 — 방을 떠나면 이 방의 재입장 핸들러가
    // onConnectQueue 에 남아 재연결마다 stale enter 를 발사하던 누수를 차단.
    this.roomReconnectDisposer?.();
    this.roomReconnectDisposer = undefined;
    if (roomId != null) {
      recordClientEvent({ type: 'PARTYROOM_UNSUBSCRIBE', partyroomId: roomId });
    }
    this.syncE2EDebugState();
  }

  public sendChatMessage(message: string) {
    if (!this.subscribedRoomId) {
      throw new Error('Cannot send chat message without subscribing to a partyroom.');
    }
    this.socketClient.send(`/pub/groups/${this.subscribedRoomId}/send`, {
      content: message,
    });
  }

  private syncE2EDebugState() {
    if (typeof window === 'undefined') {
      return;
    }

    (
      window as Window & {
        __PFPLAY_E2E__?: {
          partyroomConnected: boolean;
          subscribedRoomId?: number;
        };
      }
    ).__PFPLAY_E2E__ = {
      partyroomConnected: this.socketClient.connected,
      subscribedRoomId: this.subscribedRoomId,
    };
  }
}
