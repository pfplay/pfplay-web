import { createSystemAnnouncementStore } from './system-announcement.store';
import { AnnouncementSnapshot, MaintenanceState } from './system-announcement.types';

const createTestStore = () => createSystemAnnouncementStore();

const MOCK_SNAPSHOT: AnnouncementSnapshot = {
  announcementId: 1,
  type: 'EVENT',
  severity: 'INFO',
  titleKo: '이벤트',
  titleEn: 'Event',
  messageKo: '내용',
  messageEn: 'Content',
  scheduledStartAt: null,
  scheduledEndAt: null,
  expiresAt: null,
  sentAt: '2026-05-03T15:00:00',
};

const MOCK_MAINTENANCE: MaintenanceState = {
  phase: 'ACTIVE',
  startAt: '2026-05-04T03:00:00',
  endAt: '2026-05-04T04:00:00',
  messageKo: '점검 중',
  messageEn: 'Maintenance',
};

describe('system-announcement store', () => {
  test('초기 상태: announcements 빈 Map, dismissedIds 빈 Set, maintenance null', () => {
    const store = createTestStore();
    expect(store.getState().announcements.size).toBe(0);
    expect(store.getState().dismissedIds.size).toBe(0);
    expect(store.getState().maintenance).toBeNull();
  });

  test('add: announcementId 키로 active Map에 들어간다', () => {
    const store = createTestStore();
    store.getState().add(MOCK_SNAPSHOT);
    expect(store.getState().announcements.get(1)).toEqual(MOCK_SNAPSHOT);
  });

  test('add: 같은 id를 두 번 add해도 1개만 유지된다 (idempotent)', () => {
    const store = createTestStore();
    store.getState().add(MOCK_SNAPSHOT);
    store.getState().add(MOCK_SNAPSHOT);
    expect(store.getState().announcements.size).toBe(1);
  });

  test('cancel: active Map에서 제거된다', () => {
    const store = createTestStore();
    store.getState().add(MOCK_SNAPSHOT);
    store.getState().cancel(1);
    expect(store.getState().announcements.has(1)).toBe(false);
  });

  test('dismiss: active에서 제거하고 dismissedIds에 추가된다', () => {
    const store = createTestStore();
    store.getState().add(MOCK_SNAPSHOT);
    store.getState().dismiss(1);
    expect(store.getState().announcements.has(1)).toBe(false);
    expect(store.getState().dismissedIds.has(1)).toBe(true);
  });

  test('add: 이미 dismissedIds에 있으면 추가되지 않는다 (재발사 방지)', () => {
    const store = createTestStore();
    store.getState().add(MOCK_SNAPSHOT);
    store.getState().dismiss(1);
    store.getState().add(MOCK_SNAPSHOT);
    expect(store.getState().announcements.has(1)).toBe(false);
  });

  test('setMaintenance: state 객체를 설정한다', () => {
    const store = createTestStore();
    store.getState().setMaintenance(MOCK_MAINTENANCE);
    expect(store.getState().maintenance).toEqual(MOCK_MAINTENANCE);
  });

  test('setMaintenance: null로 초기화할 수 있다', () => {
    const store = createTestStore();
    store.getState().setMaintenance(MOCK_MAINTENANCE);
    store.getState().setMaintenance(null);
    expect(store.getState().maintenance).toBeNull();
  });
});
