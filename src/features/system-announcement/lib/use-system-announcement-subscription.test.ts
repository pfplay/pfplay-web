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
import {
  AnnouncementCancelledEvent,
  AnnouncementPublishedEvent,
  MaintenanceStartedEvent,
} from '../model/system-announcement.types';

const PUBLISHED_EVENT: AnnouncementPublishedEvent = {
  eventType: 'ANNOUNCEMENT_PUBLISHED',
  announcementId: 1,
  type: 'EVENT',
  severity: 'INFO',
  titleKo: '제목',
  titleEn: 'Title',
  messageKo: '메시지',
  messageEn: 'Message',
  scheduledStartAt: null,
  scheduledEndAt: null,
  expiresAt: null,
  sentAt: '2026-05-03T15:00:00',
};

const MAINTENANCE_STARTED_EVENT: MaintenanceStartedEvent = {
  eventType: 'MAINTENANCE_STARTED',
  announcementId: 2,
  type: 'MAINTENANCE_NOTICE',
  severity: 'WARN',
  titleKo: '점검',
  titleEn: 'Maintenance',
  messageKo: '점검 중',
  messageEn: 'Maintenance in progress',
  scheduledStartAt: '2026-05-04T03:00:00',
  scheduledEndAt: '2026-05-04T04:00:00',
  expiresAt: null,
  sentAt: '2026-05-03T15:00:00',
};

const CANCELLED_EVENT: AnnouncementCancelledEvent = {
  eventType: 'ANNOUNCEMENT_CANCELLED',
  announcementId: 1,
  cancelledAt: '2026-05-03T15:30:00',
};

beforeEach(() => {
  vi.clearAllMocks();
  useSystemAnnouncementStore.setState({
    announcements: new Map(),
    dismissedIds: new Set(),
    maintenance: null,
  });
});

describe('useSystemAnnouncementSubscription', () => {
  test('me가 없으면 connect하지 않음', () => {
    (useFetchMe as Mock).mockReturnValue({ data: undefined });
    renderHook(() => useSystemAnnouncementSubscription());
    expect(mockConnect).not.toHaveBeenCalled();
  });

  test('me가 있으면 connect 및 /topic/system/announcements 구독', () => {
    (useFetchMe as Mock).mockReturnValue({ data: { id: 1 } });
    renderHook(() => useSystemAnnouncementSubscription());
    expect(mockConnect).toHaveBeenCalledOnce();
    expect(mockSubscribe).toHaveBeenCalledWith('/topic/system/announcements', expect.any(Function));
  });

  test('ANNOUNCEMENT_PUBLISHED 수신 시 store.add 호출', () => {
    (useFetchMe as Mock).mockReturnValue({ data: { id: 1 } });
    renderHook(() => useSystemAnnouncementSubscription());
    const cb = mockSubscribe.mock.calls[0][1];
    cb({ body: JSON.stringify(PUBLISHED_EVENT) });
    expect(useSystemAnnouncementStore.getState().announcements.get(1)).toMatchObject({
      announcementId: 1,
      type: 'EVENT',
    });
  });

  test('MAINTENANCE_STARTED 수신 시 store.add + setMaintenance 호출', () => {
    (useFetchMe as Mock).mockReturnValue({ data: { id: 1 } });
    renderHook(() => useSystemAnnouncementSubscription());
    const cb = mockSubscribe.mock.calls[0][1];
    cb({ body: JSON.stringify(MAINTENANCE_STARTED_EVENT) });
    const state = useSystemAnnouncementStore.getState();
    expect(state.announcements.has(2)).toBe(true);
    expect(state.maintenance).toEqual({
      phase: 'ACTIVE',
      startAt: '2026-05-04T03:00:00',
      endAt: '2026-05-04T04:00:00',
      messageKo: '점검 중',
      messageEn: 'Maintenance in progress',
    });
  });

  test('ANNOUNCEMENT_CANCELLED 수신 시 store.cancel 호출', () => {
    (useFetchMe as Mock).mockReturnValue({ data: { id: 1 } });
    renderHook(() => useSystemAnnouncementSubscription());
    const cb = mockSubscribe.mock.calls[0][1];
    cb({ body: JSON.stringify(PUBLISHED_EVENT) });
    expect(useSystemAnnouncementStore.getState().announcements.has(1)).toBe(true);
    cb({ body: JSON.stringify(CANCELLED_EVENT) });
    expect(useSystemAnnouncementStore.getState().announcements.has(1)).toBe(false);
  });

  test('알 수 없는 eventType은 무시', () => {
    (useFetchMe as Mock).mockReturnValue({ data: { id: 1 } });
    renderHook(() => useSystemAnnouncementSubscription());
    const cb = mockSubscribe.mock.calls[0][1];
    cb({ body: JSON.stringify({ eventType: 'UNKNOWN', announcementId: 99 }) });
    expect(useSystemAnnouncementStore.getState().announcements.size).toBe(0);
  });

  test('잘못된 JSON 메시지는 무시', () => {
    (useFetchMe as Mock).mockReturnValue({ data: { id: 1 } });
    renderHook(() => useSystemAnnouncementSubscription());
    const cb = mockSubscribe.mock.calls[0][1];
    expect(() => cb({ body: 'invalid json' })).not.toThrow();
    expect(useSystemAnnouncementStore.getState().announcements.size).toBe(0);
  });

  test('eventType 필드가 없는 메시지는 무시', () => {
    (useFetchMe as Mock).mockReturnValue({ data: { id: 1 } });
    renderHook(() => useSystemAnnouncementSubscription());
    const cb = mockSubscribe.mock.calls[0][1];
    cb({ body: JSON.stringify({ announcementId: 99 }) });
    expect(useSystemAnnouncementStore.getState().announcements.size).toBe(0);
  });

  test('unmount 시 disconnect 호출', () => {
    (useFetchMe as Mock).mockReturnValue({ data: { id: 1 } });
    const { unmount } = renderHook(() => useSystemAnnouncementSubscription());
    unmount();
    expect(mockDisconnect).toHaveBeenCalledOnce();
  });
});
