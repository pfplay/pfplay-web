import { act, render, screen } from '@testing-library/react';
import { Mock, afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { Language } from '@/shared/lib/localization/constants';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useLang } from '@/shared/lib/localization/lang.context';
import EmergencyBanner from './emergency-banner';
import { useSystemAnnouncementStore } from '../model/system-announcement.store';
import { AnnouncementSnapshot } from '../model/system-announcement.types';

vi.mock('@/shared/lib/localization/i18n.context', () => ({
  useI18n: vi.fn(),
}));
vi.mock('@/shared/lib/localization/lang.context', () => ({
  useLang: vi.fn(),
}));

const stubDict = {
  system: {
    announcement: {
      emergency: { label: '긴급 공지' },
    },
  },
};

const NOW = new Date('2026-05-04T00:00:00').getTime();

const mkSnapshot = (overrides: Partial<AnnouncementSnapshot> = {}): AnnouncementSnapshot => ({
  announcementId: 22,
  type: 'EMERGENCY',
  severity: 'CRITICAL',
  titleKo: '긴급',
  titleEn: 'Urgent',
  messageKo: '긴급 메시지',
  messageEn: 'Urgent message',
  scheduledStartAt: null,
  scheduledEndAt: null,
  expiresAt: null,
  sentAt: '2026-05-03T15:00:00',
  ...overrides,
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
  (useI18n as Mock).mockReturnValue(stubDict);
  useSystemAnnouncementStore.setState({
    announcements: new Map(),
    dismissedIds: new Set(),
    maintenance: null,
  });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('EmergencyBanner', () => {
  test('locale ko면 titleKo/messageKo + label 표시', () => {
    (useLang as Mock).mockReturnValue(Language.Ko);
    render(<EmergencyBanner snapshot={mkSnapshot()} />);
    expect(screen.getByText('긴급')).toBeInTheDocument();
    expect(screen.getByText('긴급 메시지')).toBeInTheDocument();
    expect(screen.getByText('긴급 공지')).toBeInTheDocument();
  });

  test('locale en이면 titleEn/messageEn 표시', () => {
    (useLang as Mock).mockReturnValue(Language.En);
    render(<EmergencyBanner snapshot={mkSnapshot()} />);
    expect(screen.getByText('Urgent')).toBeInTheDocument();
    expect(screen.getByText('Urgent message')).toBeInTheDocument();
  });

  test('close 버튼이 없다 (persistent)', () => {
    (useLang as Mock).mockReturnValue(Language.Ko);
    render(<EmergencyBanner snapshot={mkSnapshot()} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  test('expiresAt 미래면 그 시점에 store.cancel 호출', () => {
    (useLang as Mock).mockReturnValue(Language.Ko);
    const cancelSpy = vi.spyOn(useSystemAnnouncementStore.getState(), 'cancel');
    const expiresAt = new Date(NOW + 7_000).toISOString();
    render(<EmergencyBanner snapshot={mkSnapshot({ expiresAt })} />);
    expect(cancelSpy).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(7_000);
    });
    expect(cancelSpy).toHaveBeenCalledWith(22);
  });

  test('expiresAt null이면 자동 cancel 안 함', () => {
    (useLang as Mock).mockReturnValue(Language.Ko);
    const cancelSpy = vi.spyOn(useSystemAnnouncementStore.getState(), 'cancel');
    render(<EmergencyBanner snapshot={mkSnapshot({ expiresAt: null })} />);
    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(cancelSpy).not.toHaveBeenCalled();
  });
});
