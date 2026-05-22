vi.mock('@stomp/stompjs', () => {
  return {
    Client: vi.fn(function (this: any, config: any) {
      this.connected = false;
      this.activate = vi.fn();
      this.deactivate = vi.fn();
      this.subscribe = vi.fn((dest: string) => ({
        id: `sub-${dest}`,
        unsubscribe: vi.fn(),
        destination: dest,
      }));
      this.publish = vi.fn();
      this.__config = config;
    }),
  };
});

vi.mock('@/shared/lib/functions/log/logger', () => ({
  specificLog: vi.fn(),
  warnLog: vi.fn(),
}));

vi.mock('@/shared/lib/functions/log/with-debugger', () => ({
  default: () => (fn: any) => fn,
}));

import SocketClient from './client';

function getStompClient(socketClient: SocketClient): any {
  return (socketClient as any).client;
}

function triggerConnect(socketClient: SocketClient) {
  const stompClient = getStompClient(socketClient);
  stompClient.connected = true;
  stompClient.__config.onConnect();
}

describe('SocketClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('connect', () => {
    test('연결 안 됨 → activate()를 호출한다', () => {
      const sc = new SocketClient();
      sc.connect();
      expect(getStompClient(sc).activate).toHaveBeenCalled();
    });

    test('이미 연결됨 → activate()를 호출하지 않는다', () => {
      const sc = new SocketClient();
      getStompClient(sc).connected = true;
      sc.connect();
      expect(getStompClient(sc).activate).not.toHaveBeenCalled();
    });
  });

  describe('disconnect', () => {
    test('연결됨 → deactivate()를 호출한다', async () => {
      const sc = new SocketClient();
      getStompClient(sc).connected = true;
      await sc.disconnect();
      expect(getStompClient(sc).deactivate).toHaveBeenCalled();
    });

    test('연결 안 됨 → deactivate()를 호출하지 않는다', async () => {
      const sc = new SocketClient();
      await sc.disconnect();
      expect(getStompClient(sc).deactivate).not.toHaveBeenCalled();
    });
  });

  describe('onConnect', () => {
    test('이미 연결 상태 → 콜백을 즉시 실행한다', () => {
      const sc = new SocketClient();
      getStompClient(sc).connected = true;
      const callback = vi.fn();

      sc.onConnect(callback);

      expect(callback).toHaveBeenCalled();
    });

    test('미연결 상태 → 큐에 추가 후 연결 시 실행한다', () => {
      const sc = new SocketClient();
      const callback = vi.fn();

      sc.onConnect(callback);
      expect(callback).not.toHaveBeenCalled();

      triggerConnect(sc);
      expect(callback).toHaveBeenCalled();
    });

    test('once: true + 이미 연결 → 즉시 실행하고 큐에 추가하지 않는다', () => {
      const sc = new SocketClient();
      getStompClient(sc).connected = true;
      const callback = vi.fn();

      sc.onConnect(callback, { once: true });
      expect(callback).toHaveBeenCalledTimes(1);

      // handleConnect를 다시 호출해도 once 콜백은 다시 실행되지 않아야 한다
      callback.mockClear();
      triggerConnect(sc);
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('handleConnect (내부)', () => {
    test('큐의 모든 콜백을 실행하고 once 항목을 제거한다', () => {
      const sc = new SocketClient();
      const persistent = vi.fn();
      const once = vi.fn();

      sc.onConnect(persistent);
      sc.onConnect(once, { once: true });

      triggerConnect(sc);
      expect(persistent).toHaveBeenCalledTimes(1);
      expect(once).toHaveBeenCalledTimes(1);

      // 두 번째 connect
      persistent.mockClear();
      once.mockClear();
      triggerConnect(sc);
      expect(persistent).toHaveBeenCalledTimes(1);
      expect(once).not.toHaveBeenCalled();
    });
  });

  describe('onReconnect', () => {
    test('최초 connect 에서는 실행되지 않는다', () => {
      const sc = new SocketClient();
      const cb = vi.fn();
      sc.onReconnect(cb);

      triggerConnect(sc);

      expect(cb).not.toHaveBeenCalled();
    });

    test('최초 이후의 connect(재연결)부터 매번 실행된다', () => {
      const sc = new SocketClient();
      const cb = vi.fn();
      sc.onReconnect(cb);

      triggerConnect(sc); // 최초
      expect(cb).not.toHaveBeenCalled();

      triggerConnect(sc); // 재연결 1
      expect(cb).toHaveBeenCalledTimes(1);

      triggerConnect(sc); // 재연결 2
      expect(cb).toHaveBeenCalledTimes(2);
    });

    test('반환된 해제 함수를 호출하면 이후 재연결에서 실행되지 않는다', () => {
      const sc = new SocketClient();
      const cb = vi.fn();
      const unregister = sc.onReconnect(cb);

      triggerConnect(sc); // 최초
      unregister();
      triggerConnect(sc); // 재연결

      expect(cb).not.toHaveBeenCalled();
    });
  });

  describe('subscribe', () => {
    test('onConnect를 경유하여 client.subscribe를 호출하고 subscriptions에 추가한다', () => {
      const sc = new SocketClient();
      const handler = vi.fn();

      sc.subscribe('/sub/test' as any, handler);
      triggerConnect(sc);

      expect(getStompClient(sc).subscribe).toHaveBeenCalledWith('/sub/test', handler);
      expect(sc.subscriptions).toHaveLength(1);
      expect(sc.subscriptions[0].destination).toBe('/sub/test');
    });

    test('미연결 상태에서도 subscriptions에 destination+callback을 동기적으로 기록한다', () => {
      const sc = new SocketClient();
      const handler = vi.fn();

      sc.subscribe('/sub/test' as any, handler);

      // connect 전인데도 동기적으로 등록되어 있어야 한다 (단일 진실원천)
      expect(sc.subscriptions).toHaveLength(1);
      expect(sc.subscriptions[0].destination).toBe('/sub/test');
      expect(sc.subscriptions[0].callback).toBe(handler);
      // 아직 연결 전이므로 실제 STOMP subscribe 는 호출되지 않는다
      expect(getStompClient(sc).subscribe).not.toHaveBeenCalled();
    });

    test('이미 연결된 상태 → 동기적으로 client.subscribe 를 즉시 호출하고 기록한다', () => {
      const sc = new SocketClient();
      getStompClient(sc).connected = true;
      const handler = vi.fn();

      sc.subscribe('/sub/now' as any, handler);

      expect(getStompClient(sc).subscribe).toHaveBeenCalledWith('/sub/now', handler);
      expect(sc.subscriptions).toHaveLength(1);
      expect(sc.subscriptions[0].destination).toBe('/sub/now');
      expect(sc.subscriptions[0].callback).toBe(handler);
    });

    test('onConnectQueue 에 subscribe 콜백을 더 이상 보관하지 않는다', () => {
      const sc = new SocketClient();
      const handler = vi.fn();

      sc.subscribe('/sub/test' as any, handler);

      const queue = (sc as any).onConnectQueue;
      expect(queue).toHaveLength(0);
    });

    test('(재)연결 시 connect 핸들러가 subscriptions 의 모든 항목을 구독한다', () => {
      const sc = new SocketClient();
      const a = vi.fn();
      const b = vi.fn();

      sc.subscribe('/sub/a' as any, a);
      sc.subscribe('/sub/b' as any, b);

      triggerConnect(sc);

      const subscribe = getStompClient(sc).subscribe;
      expect(subscribe).toHaveBeenCalledWith('/sub/a', a);
      expect(subscribe).toHaveBeenCalledWith('/sub/b', b);
      expect(sc.subscriptions).toHaveLength(2);
    });

    test('reconnect 시 STOMP 핸들을 갱신하며 중복 구독하지 않는다', () => {
      const sc = new SocketClient();
      const a = vi.fn();
      sc.subscribe('/sub/a' as any, a);

      triggerConnect(sc);
      expect(sc.subscriptions).toHaveLength(1);

      // disconnect → 재연결
      const stomp = getStompClient(sc);
      stomp.__config.onWebSocketClose();
      stomp.subscribe.mockClear();
      triggerConnect(sc);

      // /sub/a 가 정확히 한 번만 재구독되어야 한다 (heartbeat sub 제외)
      const subscribeCallsForA = stomp.subscribe.mock.calls.filter((c: any[]) => c[0] === '/sub/a');
      expect(subscribeCallsForA).toHaveLength(1);
      expect(sc.subscriptions).toHaveLength(1);
    });
  });

  describe('unsubscribe', () => {
    test('연결 안 됨 → 에러 없이 통과한다', () => {
      const sc = new SocketClient();
      sc.unsubscribe('/sub/test' as any);
      // 에러 없이 통과
    });

    test('해당 destination이 없으면 아무 동작도 하지 않는다', () => {
      const sc = new SocketClient();
      triggerConnect(sc);
      sc.unsubscribe('/sub/nonexistent' as any);
      // 에러 없이 통과
    });

    test('연결됨 + destination 존재 → STOMP 해제하고 subscriptions 에서 제거한다', () => {
      const sc = new SocketClient();
      sc.subscribe('/sub/room' as any, vi.fn());
      triggerConnect(sc);

      expect(sc.subscriptions).toHaveLength(1);
      const stomp = getStompClient(sc);
      const stompSub = stomp.subscribe.mock.results.find(
        (r: any) => r.value.destination === '/sub/room'
      )?.value;

      sc.unsubscribe('/sub/room' as any);

      expect(stompSub.unsubscribe).toHaveBeenCalled();
      expect(sc.subscriptions).toHaveLength(0);
    });

    test('미연결 상태에서도 subscriptions 에서 무조건 제거한다 (#5/#30 누수 해소)', () => {
      const sc = new SocketClient();
      sc.subscribe('/sub/room' as any, vi.fn());

      expect(sc.subscriptions).toHaveLength(1);

      // 아직 연결 전 — 그래도 제거되어야 한다
      sc.unsubscribe('/sub/room' as any);

      expect(sc.subscriptions).toHaveLength(0);
    });

    test('미연결 시 unsubscribe 한 destination 은 이후 connect 에서 재구독되지 않는다', () => {
      const sc = new SocketClient();
      sc.subscribe('/sub/room' as any, vi.fn());
      sc.unsubscribe('/sub/room' as any);

      triggerConnect(sc);

      const stomp = getStompClient(sc);
      const roomCalls = stomp.subscribe.mock.calls.filter((c: any[]) => c[0] === '/sub/room');
      expect(roomCalls).toHaveLength(0);
      expect(sc.subscriptions).toHaveLength(0);
    });

    test('#5 회귀잠금: subscribe A → unsubscribe A → subscribe B → disconnect → connect ⇒ B 만 구독, A 부활 없음', () => {
      const sc = new SocketClient();
      const aCb = vi.fn();
      const bCb = vi.fn();

      sc.subscribe('/sub/roomA' as any, aCb);
      sc.unsubscribe('/sub/roomA' as any);
      sc.subscribe('/sub/roomB' as any, bCb);

      const stomp = getStompClient(sc);

      // disconnect
      stomp.__config.onWebSocketClose();
      // reconnect
      stomp.subscribe.mockClear();
      triggerConnect(sc);

      const aCalls = stomp.subscribe.mock.calls.filter((c: any[]) => c[0] === '/sub/roomA');
      const bCalls = stomp.subscribe.mock.calls.filter((c: any[]) => c[0] === '/sub/roomB');

      expect(aCalls).toHaveLength(0); // A 는 부활하면 안 된다
      expect(bCalls).toHaveLength(1); // B 만 재구독
      expect(sc.subscriptions.map((s) => s.destination)).toEqual(['/sub/roomB']);
    });
  });

  describe('unsubscribeAll', () => {
    test('모든 구독을 해제하고 배열을 초기화한다', () => {
      const sc = new SocketClient();
      sc.subscribe('/sub/a' as any, vi.fn());
      sc.subscribe('/sub/b' as any, vi.fn());
      triggerConnect(sc);

      expect(sc.subscriptions).toHaveLength(2);
      const unsub0 = sc.subscriptions[0].stompSubscription?.unsubscribe;
      const unsub1 = sc.subscriptions[1].stompSubscription?.unsubscribe;

      sc.unsubscribeAll();

      expect(unsub0).toHaveBeenCalled();
      expect(unsub1).toHaveBeenCalled();
      expect(sc.subscriptions).toHaveLength(0);
    });
  });

  describe('send', () => {
    test('onConnect({ once: true })를 경유하여 client.publish를 호출한다', () => {
      const sc = new SocketClient();
      sc.send('/pub/test' as any, { data: 'hello' });

      triggerConnect(sc);

      expect(getStompClient(sc).publish).toHaveBeenCalledWith({
        destination: '/pub/test',
        body: JSON.stringify({ data: 'hello' }),
      });
    });
  });

  describe('STOMP 내장 heartbeat 옵트인 (presence disconnect 감지)', () => {
    test('Client 생성 시 heartbeatIncoming=10s / heartbeatOutgoing=5s 가 설정된다', () => {
      const sc = new SocketClient();
      const config = getStompClient(sc).__config;
      expect(config.heartbeatIncoming).toBe(10_000);
      expect(config.heartbeatOutgoing).toBe(5_000);
    });
  });

  describe('커스텀 heartbeat (LB keep-alive)', () => {
    test('연결 후 15초 간격으로 /pub/heartbeat 에 PING 을 publish 한다', () => {
      const sc = new SocketClient();
      triggerConnect(sc);

      const publish = getStompClient(sc).publish;
      publish.mockClear();

      vi.advanceTimersByTime(15_000);
      expect(publish).toHaveBeenCalledWith({
        destination: '/pub/heartbeat',
        body: JSON.stringify('PING'),
      });
      expect(publish).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(15_000);
      expect(publish).toHaveBeenCalledTimes(2);
    });

    test('15초 미만 경과에서는 PING 을 보내지 않는다 (4초 이전 동작 회귀 방지)', () => {
      const sc = new SocketClient();
      triggerConnect(sc);

      const publish = getStompClient(sc).publish;
      publish.mockClear();

      vi.advanceTimersByTime(14_999);
      expect(publish).not.toHaveBeenCalled();
    });
  });
});
