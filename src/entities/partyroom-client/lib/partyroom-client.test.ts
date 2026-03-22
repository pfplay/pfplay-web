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
    test('이미 구독이 있으면 Error를 throw한다', () => {
      mockSocketInstance.subscriptions = [{ destination: '/sub/partyrooms/1' } as any];

      expect(() => client.subscribe(2, vi.fn())).toThrow(
        'Cannot connect to multiple partyrooms at the same time.'
      );
    });

    test('구독이 없으면 올바른 경로로 subscribe를 호출한다', () => {
      mockSocketInstance.subscriptions = [];
      const handler = vi.fn();

      client.subscribe(42, handler);

      expect(mockSocketInstance.subscribe).toHaveBeenCalledWith('/sub/partyrooms/42', handler);
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
