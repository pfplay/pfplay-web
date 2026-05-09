import {
  formatScheduledTime,
  getLocalizedMessage,
  getLocalizedTitle,
  isEmergencyBanner,
  isExpired,
  isPlannedNotice,
  isToast,
  pickByLocale,
} from './announcement-helpers';
import { AnnouncementSnapshot } from '../model/system-announcement.types';

const baseSnapshot: AnnouncementSnapshot = {
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

describe('pickByLocale', () => {
  test('ko면 ko 값 반환', () => {
    expect(pickByLocale({ ko: 'A', en: 'B' }, 'ko')).toBe('A');
  });

  test('en이면 en 값 반환', () => {
    expect(pickByLocale({ ko: 'A', en: 'B' }, 'en')).toBe('B');
  });
});

describe('getLocalizedTitle/Message', () => {
  test('locale ko로 호출하면 *Ko 필드 반환', () => {
    expect(getLocalizedTitle(baseSnapshot, 'ko')).toBe('제목');
    expect(getLocalizedMessage(baseSnapshot, 'ko')).toBe('메시지');
  });

  test('locale en으로 호출하면 *En 필드 반환', () => {
    expect(getLocalizedTitle(baseSnapshot, 'en')).toBe('Title');
    expect(getLocalizedMessage(baseSnapshot, 'en')).toBe('Message');
  });
});

describe('isExpired', () => {
  test('expiresAt이 null이면 false', () => {
    expect(isExpired(baseSnapshot, Date.now())).toBe(false);
  });

  test('expiresAt이 nowMs보다 과거면 true', () => {
    const snap = { ...baseSnapshot, expiresAt: '2025-01-01T00:00:00' };
    const now = new Date('2026-01-01T00:00:00').getTime();
    expect(isExpired(snap, now)).toBe(true);
  });

  test('expiresAt이 nowMs보다 미래면 false', () => {
    const snap = { ...baseSnapshot, expiresAt: '2027-01-01T00:00:00' };
    const now = new Date('2026-01-01T00:00:00').getTime();
    expect(isExpired(snap, now)).toBe(false);
  });
});

describe('type classifiers', () => {
  test('isToast: type=EVENT && severity in (INFO, WARN)', () => {
    expect(isToast({ ...baseSnapshot, type: 'EVENT', severity: 'INFO' })).toBe(true);
    expect(isToast({ ...baseSnapshot, type: 'EVENT', severity: 'WARN' })).toBe(true);
    expect(isToast({ ...baseSnapshot, type: 'EVENT', severity: 'CRITICAL' })).toBe(false);
    expect(isToast({ ...baseSnapshot, type: 'EMERGENCY', severity: 'INFO' })).toBe(false);
  });

  test('isEmergencyBanner: type=EMERGENCY', () => {
    expect(isEmergencyBanner({ ...baseSnapshot, type: 'EMERGENCY' })).toBe(true);
    expect(isEmergencyBanner({ ...baseSnapshot, type: 'EVENT' })).toBe(false);
  });

  test('isPlannedNotice: type=MAINTENANCE_NOTICE', () => {
    expect(isPlannedNotice({ ...baseSnapshot, type: 'MAINTENANCE_NOTICE' })).toBe(true);
    expect(isPlannedNotice({ ...baseSnapshot, type: 'EVENT' })).toBe(false);
  });
});

describe('formatScheduledTime', () => {
  test('ISO 문자열을 YYYY-MM-DD HH:mm 으로 변환', () => {
    expect(formatScheduledTime('2026-05-04T03:00:00')).toBe('2026-05-04 03:00');
  });

  test('초 단위가 없는 ISO도 동작', () => {
    expect(formatScheduledTime('2026-05-04T03:00')).toBe('2026-05-04 03:00');
  });
});
