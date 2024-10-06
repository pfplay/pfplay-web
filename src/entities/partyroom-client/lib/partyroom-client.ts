import { IMessage } from '@stomp/stompjs';
import SocketClient from '@/shared/api/websocket/client';

/**
 * Socket Client를 캡슐화하여 최소한의 인터페이스만을 노출하며,
 * partyroom 구독에 대한 정책을 포함하는 클래스
 */
export default class PartyroomClient {
  private socketClient: SocketClient;
  private subscribedRoomId: number | undefined;

  public constructor() {
    this.socketClient = new SocketClient();
  }

  public connect() {
    this.socketClient.connect();
  }

  public get connected() {
    return this.socketClient.connected;
  }

  public whenConnected(callback: () => void) {
    this.socketClient.registerConnectListener(callback);
  }

  public subscribe(partyroomId: number, handler: (message: IMessage) => void) {
    if (!!this.socketClient.subscriptions.length) {
      // TODO: 다른 방 연결 끊고 이 방에 연결할래? 라는 문구 출력하도록 작업
      throw new Error('Cannot connect to multiple partyrooms at the same time.');
    }

    this.socketClient.subscribe(`/sub/partyrooms/${partyroomId}`, handler);
    this.subscribedRoomId = partyroomId;
  }

  public unsubscribeCurrentRoom() {
    this.socketClient.unsubscribe(`/sub/partyrooms/${this.subscribedRoomId}`);
    this.subscribedRoomId = undefined;
  }

  public sendChatMessage(message: string) {
    if (!this.subscribedRoomId) {
      throw new Error('Cannot send chat message without subscribing to a partyroom.');
    }
    this.socketClient.send(`/pub/groups/${this.subscribedRoomId}/send`, {
      content: message,
    });
  }
}
