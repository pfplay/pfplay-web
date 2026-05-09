import { render } from '@testing-library/react';
import { beforeEach, describe, expect, test } from 'vitest';
import HydrateAnnouncementsFromStatus from './hydrate-announcements-from-status';
import { useSystemAnnouncementStore } from '../model/system-announcement.store';
import { AnnouncementSnapshot, MaintenanceState } from '../model/system-announcement.types';

const mkSnapshot = (id: number): AnnouncementSnapshot => ({
  announcementId: id,
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
});

const ACTIVE: MaintenanceState = {
  phase: 'ACTIVE',
  startAt: '2026-05-04T03:00:00',
  endAt: '2026-05-04T04:00:00',
  messageKo: 'ko',
  messageEn: 'en',
};

beforeEach(() => {
  useSystemAnnouncementStore.setState({
    announcements: new Map(),
    dismissedIds: new Set(),
    maintenance: null,
  });
});

describe('HydrateAnnouncementsFromStatus', () => {
  test('initialActive 각각이 store.add 로 들어간다', () => {
    render(
      <HydrateAnnouncementsFromStatus
        initialActive={[mkSnapshot(1), mkSnapshot(2)]}
        initialMaintenance={null}
      />
    );
    expect(useSystemAnnouncementStore.getState().announcements.has(1)).toBe(true);
    expect(useSystemAnnouncementStore.getState().announcements.has(2)).toBe(true);
  });

  test('initialMaintenance 가 null 이 아니면 store.setMaintenance 호출', () => {
    render(<HydrateAnnouncementsFromStatus initialActive={[]} initialMaintenance={ACTIVE} />);
    expect(useSystemAnnouncementStore.getState().maintenance).toEqual(ACTIVE);
  });

  test('initialActive 빈 배열 / maintenance null 이면 상태 변화 없음', () => {
    render(<HydrateAnnouncementsFromStatus initialActive={[]} initialMaintenance={null} />);
    expect(useSystemAnnouncementStore.getState().announcements.size).toBe(0);
    expect(useSystemAnnouncementStore.getState().maintenance).toBeNull();
  });

  test('아무것도 렌더하지 않는다 (null 반환)', () => {
    const { container } = render(
      <HydrateAnnouncementsFromStatus initialActive={[]} initialMaintenance={null} />
    );
    expect(container.firstChild).toBeNull();
  });
});
