import { Client, IFrame } from '@stomp/stompjs';
import { StompSubscription } from '@stomp/stompjs/src/stomp-subscription';
import { messageCallbackType } from '@stomp/stompjs/src/types';
import { clientEnv } from '@/shared/config';
import { specificLog } from '@/shared/lib/functions/log/logger';
import withDebugger from '@/shared/lib/functions/log/with-debugger';
import { recordClientEvent } from '@/shared/lib/observability/client-events';

const logger = withDebugger(0);
const log = logger<string>((msg) => {
  if (msg.includes('/heartbeat')) return; // ignore heartbeat logs

  const hhmmss = new Date().toTimeString().split(' ')[0];

  specificLog(`[${hhmmss}] ${msg}`);
});

export type Destination = `/${string}`;
/**
 * 구독의 단일 진실원천(SoT) 엔트리.
 * `destination` + `callback` 은 "원하는 구독 집합"을 표현하며,
 * `stompSubscription` 은 현재 살아있는 STOMP 핸들(연결 시에만 존재)이다.
 * reconnect 는 오직 이 배열을 기준으로 reconcile 한다.
 */
export interface Subscription {
  destination: Destination;
  callback: messageCallbackType;
  stompSubscription?: StompSubscription;
}

export type OnConnectOptions = {
  /**
   * `true`일 시, 최초 connect 시에만 실행되며 reconnect 시에는 실행되지 않습니다.
   * @default false
   */
  once?: boolean;
};
type OnConnect = {
  callback: () => void;
  options?: OnConnectOptions;
};

export default class SocketClient {
  private client: Client;
  private onConnectQueue: OnConnect[] = [];
  public subscriptions: Subscription[] = [];
  private heartbeatIntervalId: ReturnType<typeof setInterval> | undefined;
  private heartbeatSubscription: StompSubscription | undefined;

  public constructor() {
    const handleConnect = () => {
      recordClientEvent({ type: 'WS_CONNECT', brokerURL: this.client.brokerURL ?? '' });
      this.startHeartbeat();

      // subscriptions[] (원하는 구독 집합) 기준으로 reconcile.
      // 살아있는 STOMP 핸들이 있으면 깔끔히 버리고 다시 구독 → 중복 구독 방지.
      this.subscriptions.forEach((subscription) => {
        subscription.stompSubscription?.unsubscribe();
        subscription.stompSubscription = this.client.subscribe(
          subscription.destination,
          subscription.callback
        );
      });

      this.onConnectQueue.forEach(({ callback }) => callback());
      this.onConnectQueue = this.onConnectQueue.filter(({ options }) => !options?.once);
    };

    const handleDisconnect = () => {
      recordClientEvent({
        type: 'WS_DISCONNECT',
        reason: 'transport-closed',
        subscriptionCount: this.subscriptions.length,
      });
      this.stopHeartbeat();
      this.teardownLiveSubscriptions();
    };

    const handleStompError = (frame: IFrame) => {
      recordClientEvent({
        type: 'WS_STOMP_ERROR',
        message: frame.headers?.['message'] ?? frame.body ?? 'unknown',
      });
      handleDisconnect();
    };

    this.client = new Client({
      brokerURL: clientEnv.NEXT_PUBLIC_API_WS_HOST_NAME,
      reconnectDelay: 5000,
      // STOMP 내장 heartbeat — 양측 옵트인 시에만 동작 (미옵트인 시 협상이 0,0 폴백).
      // backend WebSocketConfig.setHeartbeatValue([10000, 5000]) 와 매칭.
      // 모바일 백그라운드 / silent disconnect 를 ~7.5초 안에 감지 — presence grace 모델 전제.
      heartbeatIncoming: 10_000,
      heartbeatOutgoing: 5_000,
      debug: log,
      onConnect: handleConnect,
      onWebSocketClose: handleDisconnect,
      onStompError: handleStompError,
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
   * 기본적으론 매 연결(reconnect 등)마다 실행되지만, `options.once`가 `true`일 시 최초 connect 시에만 실행됩니다.
   */
  public onConnect(callback: () => void, options?: OnConnectOptions) {
    if (this.connected) {
      callback();
      if (options?.once) return;
    }

    this.onConnectQueue.push({ callback, options });
  }

  /**
   * 구독을 시작합니다.
   * `subscriptions[]` (원하는 구독 집합)에 동기적으로 기록합니다 — 단일 진실원천.
   * 이미 connect 상태라면 즉시 실제 STOMP 구독을 수행하고,
   * 아니라면 connect 시 connect 핸들러가 `subscriptions[]` 기준으로 (재)구독합니다.
   * reconnect 시에도 `subscriptions[]` 만으로 reconcile 됩니다.
   *
   * @precondition 호출자는 destination 의 유일성을 보장해야 합니다 (destination 당 활성 구독 1개).
   *   intervening `unsubscribe` 없이 동일 destination 으로 재호출하면 `subscriptions[]` 에
   *   중복 항목이 쌓여 reconnect reconcile 시 중복 live 핸들이 생성되므로 미지원입니다.
   *   단일 destination / replace 강제는 소비자 책임입니다 (PartyroomClient single-room guard / replace 정책).
   */
  public subscribe(destination: Destination, callback: messageCallbackType) {
    const subscription: Subscription = { destination, callback };

    if (this.connected) {
      subscription.stompSubscription = this.client.subscribe(destination, callback);
    }

    this.subscriptions.push(subscription);
  }

  /**
   * 구독을 해지합니다.
   * `connected` 여부와 무관하게 `subscriptions[]` (원하는 구독 집합)에서 무조건 제거합니다.
   * 살아있는 STOMP 핸들이 있으면 실제 해지도 수행합니다.
   * 제거 후에는 이후 reconnect 가 이 destination 을 재구독하지 않습니다 (#5 부활 차단).
   */
  public unsubscribe(destination: Destination) {
    const subscription = this.subscriptions.find(
      (subscription) => subscription.destination === destination
    );
    if (!subscription) return;

    subscription.stompSubscription?.unsubscribe();
    this.subscriptions = this.subscriptions.filter(
      (subscription) => subscription.destination !== destination
    );
  }

  /**
   * 모든 구독을 해지합니다 (원하는 구독 집합까지 비웁니다).
   */
  public unsubscribeAll() {
    this.subscriptions.forEach((subscription) => subscription.stompSubscription?.unsubscribe());
    this.subscriptions = [];
  }

  /**
   * 살아있는 STOMP 핸들만 정리합니다.
   * `subscriptions[]` (원하는 구독 집합)은 보존하여 reconnect 시 reconcile 가능하게 합니다.
   */
  private teardownLiveSubscriptions() {
    this.subscriptions.forEach((subscription) => {
      subscription.stompSubscription?.unsubscribe();
      subscription.stompSubscription = undefined;
    });
  }

  /*
   * 메시지를 전송합니다.
   */
  public send(destination: Destination, body: unknown) {
    this.onConnect(
      () => {
        this.client.publish({
          destination,
          body: JSON.stringify(body),
        });
      },
      { once: true }
    );
  }

  /**
   * NOTE: GCP HTTP(S) LB keep-alive 용 커스텀 heartbeat.
   * (30초 동안 클라이언트 측 송신이 없다면 백엔드 측 GCP가 연결을 끊어버립니다)
   *
   * STOMP 내장 heartbeat 와 책임이 다름 — 본 PING/PONG 은 LB keep-alive 전용,
   * STOMP 내장 heartbeat 는 disconnect 감지(presence) 전용. 두 heartbeat 영구 공존.
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

    // 30초 LB timeout 의 50% 안전 마진 (75% 룰 기준 22.5초까지 안전).
    // 트래픽 3.75배 감소 (이전 4초 → 15초).
    this.heartbeatIntervalId = setInterval(() => {
      this.send(DESTINATION.PUB, 'PING');
    }, 15_000);
  }

  private stopHeartbeat() {
    this.heartbeatSubscription?.unsubscribe();
    clearInterval(this.heartbeatIntervalId);
  }
}
