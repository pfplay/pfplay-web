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
    this.socketClient.onConnect(callback, options);
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
