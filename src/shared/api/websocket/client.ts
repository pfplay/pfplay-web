import { Client } from '@stomp/stompjs';
import { StompSubscription } from '@stomp/stompjs/src/stomp-subscription';
import { messageCallbackType } from '@stomp/stompjs/src/types';
import { specificLog } from '@/shared/lib/functions/log/logger';
import withDebugger from '@/shared/lib/functions/log/with-debugger';

const logger = withDebugger(0);
const log = logger<string>((msg) => {
  if (msg.includes('/heartbeat')) return; // ignore heartbeat logs

  const hhmmss = new Date().toTimeString().split(' ')[0];

  specificLog(`[${hhmmss}] ${msg}`);
});

export type Destination = `/${string}`;
export interface Subscription extends StompSubscription {
  destination: Destination;
}

export default class SocketClient {
  private client: Client;
  private connectListeners: (() => void)[] = [];
  public subscriptions: Subscription[] = [];
  private heartbeatIntervalId: ReturnType<typeof setInterval> | undefined;
  private heartbeatSubscription: StompSubscription | undefined;

  public constructor() {
    const handleConnect = () => {
      this.startHeartbeat();

      this.connectListeners.forEach((listener) => listener());
      this.connectListeners = [];
    };

    const handleDisconnect = () => {
      this.stopHeartbeat();
      this.unsubscribeAll();
    };

    this.client = new Client({
      brokerURL: process.env.NEXT_PUBLIC_API_WS_HOST_NAME as string,
      reconnectDelay: 5000,
      debug: log,
      onConnect: handleConnect,
      onWebSocketClose: handleDisconnect,
      onStompError: handleDisconnect,
    });
  }

  /**
   * 커넥션이 맺혔는지 여부를 반환합니다.
   */
  public get connected() {
    return this.client.connected;
  }

  /**
   * 커넥션을 맺습니다.
   */
  public connect() {
    if (this.connected) return;

    this.client.activate();
  }

  /**
   * 커넥션을 끊습니다.
   */
  public async disconnect() {
    if (!this.connected) return;

    await this.client.deactivate();
  }

  /**
   * 커넥션이 맺히면 콜백을 실행합니다.
   * **이미 커넥션이 맺혔을 경우 즉시 실행됩니다.**
   */
  public registerConnectListener(listener: () => void) {
    if (this.connected) {
      listener();
    } else {
      this.connectListeners.push(listener);
    }
  }

  /**
   * 구독을 시작합니다.
   */
  public subscribe(destination: Destination, callback: messageCallbackType) {
    const subscription = this.client.subscribe(destination, callback);
    this.subscriptions.push({
      ...subscription,
      destination,
    });
  }

  /**
   * 구독을 해지합니다.
   */
  public unsubscribe(destination: Destination) {
    if (!this.connected) return;

    const subscription = this.subscriptions.find(
      (subscription) => subscription.destination === destination
    );
    if (!subscription) return;

    subscription.unsubscribe();
    this.subscriptions = this.subscriptions.filter(
      (subscription) => subscription.destination !== destination
    );
  }

  /**
   * 모든 구독을 해지합니다.
   */
  public unsubscribeAll() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    this.subscriptions = [];
  }

  /*
   * 메시지를 전송합니다.
   */
  public send(destination: Destination, body: unknown) {
    this.client.publish({
      destination,
      body: JSON.stringify(body),
    });
  }

  /**
   * NOTE: 소켓 커넥션 유지를 위해 heartbeat를 전송합니다.
   * (60초 동안 클라이언트 측 송신이 없다면 백엔드 측 GCP가 연결을 끊어버립니다)
   *
   * 후에 Stomp 내장 heartbeat 기능을 사용하도록 변경할 예정
   * @see https://pfplay.slack.com/archives/C051N8A0ZSB/p1724609022991849
   */
  private startHeartbeat() {
    const DESTINATION = {
      SUB: '/user/sub/heartbeat',
      PUB: '/pub/heartbeat',
    } as const;

    this.heartbeatSubscription = this.client.subscribe(DESTINATION.SUB, (_pong) => {
      /* Do nothing */
    });

    this.heartbeatIntervalId = setInterval(() => {
      this.send(DESTINATION.PUB, 'PING');
    }, 4000);
  }
  private stopHeartbeat() {
    this.heartbeatSubscription?.unsubscribe();
    clearInterval(this.heartbeatIntervalId);
  }
}
