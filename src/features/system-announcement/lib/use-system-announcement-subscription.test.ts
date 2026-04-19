const mockConnect = vi.fn();
const mockDisconnect = vi.fn();
const mockSubscribe = vi.fn();

vi.mock('@/shared/api/websocket/client', () => ({
  default: vi.fn().mockImplementation(function () {
    this.connect = mockConnect;
    this.disconnect = mockDisconnect;
    this.subscribe = mockSubscribe;
  }),
}));

vi.mock('@/entities/me', () => ({
  useFetchMe: vi.fn(),
}));

import { renderHook } from '@testing-library/react';
import { useFetchMe } from '@/entities/me';
import useSystemAnnouncementSubscription from './use-system-announcement-subscription';
import { useSystemAnnouncementStore } from '../model/system-announcement.store';

beforeEach(() => {
  vi.clearAllMocks();
  useSystemAnnouncementStore.setState({
    currentAnnouncement: null,
    dismissedIds: new Set(),
  });
});

describe('useSystemAnnouncementSubscription', () => {
  test('me가 없으면 connect하지 않음', () => {
    (useFetchMe as Mock).mockReturnValue({ data: undefined });
    renderHook(() => useSystemAnnouncementSubscription());
    expect(mockConnect).not.toHaveBeenCalled();
  });

  test('me가 있으면 connect 및 subscribe 호출', () => {
    (useFetchMe as Mock).mockReturnValue({ data: { id: 1 } });
    renderHook(() => useSystemAnnouncementSubscription());
    expect(mockConnect).toHaveBeenCalledOnce();
    expect(mockSubscribe).toHaveBeenCalledWith('/sub/system/announcements', expect.any(Function));
  });

  test('유효한 메시지 수신 시 store에 공지 반영', () => {
    (useFetchMe as Mock).mockReturnValue({ data: { id: 1 } });
    renderHook(() => useSystemAnnouncementSubscription());
    const subscribeCallback = mockSubscribe.mock.calls[0][1];
    subscribeCallback({
      body: JSON.stringify({
        id: 'ann-test',
        type: 'MAINTENANCE',
        title: '점검',
        content: '점검입니다.',
      }),
    });
    expect(useSystemAnnouncementStore.getState().currentAnnouncement?.id).toBe('ann-test');
  });

  test('잘못된 JSON 메시지는 무시', () => {
    (useFetchMe as Mock).mockReturnValue({ data: { id: 1 } });
    renderHook(() => useSystemAnnouncementSubscription());
    const subscribeCallback = mockSubscribe.mock.calls[0][1];
    expect(() => subscribeCallback({ body: 'invalid json' })).not.toThrow();
    expect(useSystemAnnouncementStore.getState().currentAnnouncement).toBeNull();
  });

  test('unmount 시 disconnect 호출', () => {
    (useFetchMe as Mock).mockReturnValue({ data: { id: 1 } });
    const { unmount } = renderHook(() => useSystemAnnouncementSubscription());
    unmount();
    expect(mockDisconnect).toHaveBeenCalledOnce();
  });
});
