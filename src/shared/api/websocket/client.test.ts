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
  });

  describe('unsubscribe', () => {
    test('연결 안 됨 → 아무 동작도 하지 않는다', () => {
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

    test('해당 destination이 있으면 해제하고 배열에서 제거한다', () => {
      const sc = new SocketClient();
      sc.subscribe('/sub/room' as any, vi.fn());
      triggerConnect(sc);

      expect(sc.subscriptions).toHaveLength(1);
      const unsubFn = sc.subscriptions[0].unsubscribe;

      sc.unsubscribe('/sub/room' as any);

      expect(unsubFn).toHaveBeenCalled();
      expect(sc.subscriptions).toHaveLength(0);
    });
  });

  describe('unsubscribeAll', () => {
    test('모든 구독을 해제하고 배열을 초기화한다', () => {
      const sc = new SocketClient();
      sc.subscribe('/sub/a' as any, vi.fn());
      sc.subscribe('/sub/b' as any, vi.fn());
      triggerConnect(sc);

      expect(sc.subscriptions).toHaveLength(2);
      const unsub0 = sc.subscriptions[0].unsubscribe;
      const unsub1 = sc.subscriptions[1].unsubscribe;

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
