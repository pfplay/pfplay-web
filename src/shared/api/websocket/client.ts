import { Client } from '@stomp/stompjs';
import { StompSubscription } from '@stomp/stompjs/src/stomp-subscription';
import { messageCallbackType } from '@stomp/stompjs/src/types';
import { specificLog } from '@/shared/lib/functions/log/logger';
import withDebugger from '@/shared/lib/functions/log/with-debugger';

const logger = withDebugger(0);
const log = logger(specificLog);

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
    this.client = new Client({
      brokerURL: process.env.NEXT_PUBLIC_API_WS_HOST_NAME as string,
      reconnectDelay: 5000,
      debug: (msg) => {
        // ignore heartbeat logs
        if (!msg.includes('/heartbeat')) {
          log(msg);
        }
      },
    });
  }

  public get connected() {
    return this.client.connected;
  }

  public connect() {
    if (!this.connected) {
      this.client.onConnect = () => {
        this.startHeartbeat();
        this.connectListeners.forEach((listener) => listener());
        this.connectListeners = [];
      };

      this.client.activate();
    }
  }

  public async disconnect() {
    if (this.connected) {
      this.stopHeartbeat();
      this.subscriptions.forEach((subscription) => subscription.unsubscribe());

      await this.client.deactivate();
    }
  }

  public registerConnectListener(listener: () => void) {
    if (this.connected) {
      listener();
    } else {
      this.connectListeners.push(listener);
    }
  }

  public subscribe(destination: Destination, callback: messageCallbackType) {
    const subscription = this.client.subscribe(destination, callback);
    this.subscriptions.push({
      ...subscription,
      destination,
    });
  }

  public unsubscribe(destination: Destination) {
    const subscription = this.subscriptions.find(
      (subscription) => subscription.destination === destination
    );
    if (!subscription) return;

    subscription.unsubscribe();
    this.subscriptions = this.subscriptions.filter(
      (subscription) => subscription.destination !== destination
    );
  }

  public unsubscribeAll() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    this.subscriptions = [];
  }

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
