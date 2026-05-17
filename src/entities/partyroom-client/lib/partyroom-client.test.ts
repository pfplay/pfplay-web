vi.mock('@/shared/api/websocket/client');

import SocketClient from '@/shared/api/websocket/client';
import PartyroomClient from './partyroom-client';

const MockSocketClient = SocketClient as MockedClass<typeof SocketClient>;

describe('PartyroomClient', () => {
  let client: PartyroomClient;
  let mockSocketInstance: Mocked<SocketClient>;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new PartyroomClient();
    mockSocketInstance = MockSocketClient.mock.instances[0] as Mocked<SocketClient>;

    // SoT(subscriptions[]) 를 실제 client.ts 의미대로 동작시켜
    // "단일 destination" 불변식을 진짜로 검증할 수 있게 한다.
    mockSocketInstance.subscriptions = [];
    mockSocketInstance.subscribe.mockImplementation((destination: any, callback: any) => {
      mockSocketInstance.subscriptions.push({ destination, callback } as any);
    });
    mockSocketInstance.unsubscribe.mockImplementation((destination: any) => {
      mockSocketInstance.subscriptions = mockSocketInstance.subscriptions.filter(
        (s) => s.destination !== destination
      );
    });
  });

  test('connect() → socketClient.connect()를 위임한다', () => {
    client.connect();
    expect(mockSocketInstance.connect).toHaveBeenCalled();
  });

  test('connected → socketClient.connected를 위임한다', () => {
    Object.defineProperty(mockSocketInstance, 'connected', { get: () => true });
    expect(client.connected).toBe(true);
  });

  test('onConnect → socketClient.onConnect를 위임한다', () => {
    const callback = vi.fn();
    const options = { once: true };
    client.onConnect(callback, options);
    expect(mockSocketInstance.onConnect).toHaveBeenCalledWith(callback, options);
  });

  describe('subscribe', () => {
    test('구독이 없으면 올바른 경로로 subscribe를 호출한다', () => {
      const handler = vi.fn();

      client.subscribe(42, handler);

      expect(mockSocketInstance.subscribe).toHaveBeenCalledWith('/sub/partyrooms/42', handler);
    });

    test('이미 다른 방을 구독 중이면 throw하지 않고 기존 방을 해지한 뒤 새 방을 구독한다 (#30 throw 발원 제거 + 단일 destination)', () => {
      const handlerA = vi.fn();
      const handlerB = vi.fn();

      client.subscribe(1, handlerA);

      expect(() => client.subscribe(2, handlerB)).not.toThrow();

      // 기존 방 해지가 새 방 구독보다 먼저 일어나야 한다 (unsubscribe-then-subscribe 순서).
      const unsubscribeOrder = mockSocketInstance.unsubscribe.mock.invocationCallOrder[0];
      const subscribeBOrder = mockSocketInstance.subscribe.mock.calls.findIndex(
        ([dest]) => dest === '/sub/partyrooms/2'
      );
      expect(mockSocketInstance.unsubscribe).toHaveBeenCalledWith('/sub/partyrooms/1');
      expect(mockSocketInstance.subscribe).toHaveBeenLastCalledWith('/sub/partyrooms/2', handlerB);
      expect(unsubscribeOrder).toBeLessThan(
        mockSocketInstance.subscribe.mock.invocationCallOrder[subscribeBOrder]
      );

      // SoT(subscriptions[]) 에는 새 방(2)만 단 1개 남아야 한다.
      expect(mockSocketInstance.subscriptions).toHaveLength(1);
      expect(mockSocketInstance.subscriptions[0].destination).toBe('/sub/partyrooms/2');
    });

    test('같은 방을 다시 subscribe하면 중복 SoT 엔트리를 만들지 않는다 (idempotent)', () => {
      const handler = vi.fn();

      client.subscribe(7, handler);
      client.subscribe(7, handler);

      // 동일 destination 으로 두 번째 socketClient.subscribe 가 호출되면
      // T3.1 의 단일 destination 전제(중복 SoT 엔트리)를 위반한다 — 막아야 한다.
      const subscribeCallsForSeven = mockSocketInstance.subscribe.mock.calls.filter(
        ([dest]) => dest === '/sub/partyrooms/7'
      );
      expect(subscribeCallsForSeven).toHaveLength(1);
      expect(mockSocketInstance.subscriptions).toHaveLength(1);
      expect(mockSocketInstance.subscriptions[0].destination).toBe('/sub/partyrooms/7');
    });
  });

  test('unsubscribeCurrentRoom → 올바른 경로로 unsubscribe를 호출한다', () => {
    mockSocketInstance.subscriptions = [];
    client.subscribe(10, vi.fn());

    client.unsubscribeCurrentRoom();

    expect(mockSocketInstance.unsubscribe).toHaveBeenCalledWith('/sub/partyrooms/10');
  });

  describe('sendChatMessage', () => {
    test('구독 전에 호출하면 Error를 throw한다', () => {
      expect(() => client.sendChatMessage('hello')).toThrow(
        'Cannot send chat message without subscribing to a partyroom.'
      );
    });

    test('구독 후에 호출하면 올바른 경로와 내용으로 send를 호출한다', () => {
      mockSocketInstance.subscriptions = [];
      client.subscribe(7, vi.fn());

      client.sendChatMessage('hi there');

      expect(mockSocketInstance.send).toHaveBeenCalledWith('/pub/groups/7/send', {
        content: 'hi there',
      });
    });
  });
});
