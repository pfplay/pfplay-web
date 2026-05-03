import { createSystemAnnouncementStore } from './system-announcement.store';
import { SystemAnnouncementEvent } from './system-announcement.types';

const createTestStore = () => createSystemAnnouncementStore();

const MOCK_EVENT: SystemAnnouncementEvent = {
  id: 'ann-001',
  type: 'MAINTENANCE',
  title: '서버 점검 안내',
  content: '점검이 예정되어 있습니다.',
  scheduledAt: 1745060400000,
};

describe('system-announcement store', () => {
  test('초기 상태: currentAnnouncement가 null', () => {
    const store = createTestStore();
    expect(store.getState().currentAnnouncement).toBeNull();
  });

  test('showAnnouncement: 새 공지를 설정', () => {
    const store = createTestStore();
    store.getState().showAnnouncement(MOCK_EVENT);
    expect(store.getState().currentAnnouncement).toEqual(MOCK_EVENT);
  });

  test('dismiss: currentAnnouncement를 null로 설정하고 dismissedIds에 추가', () => {
    const store = createTestStore();
    store.getState().showAnnouncement(MOCK_EVENT);
    store.getState().dismiss();
    expect(store.getState().currentAnnouncement).toBeNull();
    expect(store.getState().isDismissed(MOCK_EVENT.id)).toBe(true);
  });

  test('isDismissed: dismiss된 ID는 true, 아닌 ID는 false', () => {
    const store = createTestStore();
    store.getState().showAnnouncement(MOCK_EVENT);
    store.getState().dismiss();
    expect(store.getState().isDismissed('ann-001')).toBe(true);
    expect(store.getState().isDismissed('ann-002')).toBe(false);
  });

  test('showAnnouncement: 이미 dismiss된 공지는 무시', () => {
    const store = createTestStore();
    store.getState().showAnnouncement(MOCK_EVENT);
    store.getState().dismiss();
    store.getState().showAnnouncement(MOCK_EVENT);
    expect(store.getState().currentAnnouncement).toBeNull();
  });
});
