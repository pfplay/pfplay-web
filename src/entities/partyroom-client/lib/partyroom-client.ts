import { IMessage } from '@stomp/stompjs';
import SocketClient, { OnConnectOptions } from '@/shared/api/websocket/client';

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

  public subscribe(partyroomId: number, handler: (message: IMessage) => void) {
    if (this.socketClient.subscriptions.length) {
      // TODO: 다른 방 연결 끊고 이 방에 연결할래? 라는 문구 출력하도록 작업
      throw new Error('Cannot connect to multiple partyrooms at the same time.');
    }

    this.socketClient.subscribe(`/sub/partyrooms/${partyroomId}`, handler);
    this.subscribedRoomId = partyroomId;
    this.syncE2EDebugState();
  }

  public unsubscribeCurrentRoom() {
    this.socketClient.unsubscribe(`/sub/partyrooms/${this.subscribedRoomId}`);
    this.subscribedRoomId = undefined;
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
