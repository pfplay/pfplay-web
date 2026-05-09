import { act, fireEvent, render, screen } from '@testing-library/react';
import { Mock, afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { Language } from '@/shared/lib/localization/constants';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useLang } from '@/shared/lib/localization/lang.context';
import EventToast from './event-toast';
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
      event: { close: '닫기' },
    },
  },
};

const NOW = new Date('2026-05-04T00:00:00').getTime();

const mkSnapshot = (overrides: Partial<AnnouncementSnapshot> = {}): AnnouncementSnapshot => ({
  announcementId: 11,
  type: 'EVENT',
  severity: 'INFO',
  titleKo: '이벤트 제목',
  titleEn: 'Event Title',
  messageKo: '이벤트 내용',
  messageEn: 'Event Content',
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

describe('EventToast', () => {
  test('locale ko면 titleKo/messageKo 표시', () => {
    (useLang as Mock).mockReturnValue(Language.Ko);
    render(<EventToast snapshot={mkSnapshot()} />);
    expect(screen.getByText('이벤트 제목')).toBeInTheDocument();
    expect(screen.getByText('이벤트 내용')).toBeInTheDocument();
  });

  test('locale en이면 titleEn/messageEn 표시', () => {
    (useLang as Mock).mockReturnValue(Language.En);
    render(<EventToast snapshot={mkSnapshot()} />);
    expect(screen.getByText('Event Title')).toBeInTheDocument();
    expect(screen.getByText('Event Content')).toBeInTheDocument();
  });

  test('close 버튼 클릭 시 store.dismiss(announcementId) 호출', () => {
    (useLang as Mock).mockReturnValue(Language.Ko);
    const dismissSpy = vi.spyOn(useSystemAnnouncementStore.getState(), 'dismiss');
    render(<EventToast snapshot={mkSnapshot()} />);
    fireEvent.click(screen.getByTestId('event-toast-close'));
    expect(dismissSpy).toHaveBeenCalledWith(11);
  });

  test('expiresAt 미래면 그 시점에 store.cancel 호출', () => {
    (useLang as Mock).mockReturnValue(Language.Ko);
    const cancelSpy = vi.spyOn(useSystemAnnouncementStore.getState(), 'cancel');
    const expiresAt = new Date(NOW + 5_000).toISOString();
    render(<EventToast snapshot={mkSnapshot({ expiresAt })} />);
    expect(cancelSpy).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(5_000);
    });
    expect(cancelSpy).toHaveBeenCalledWith(11);
  });

  test('expiresAt 이 null 이면 자동 cancel 호출 없음', () => {
    (useLang as Mock).mockReturnValue(Language.Ko);
    const cancelSpy = vi.spyOn(useSystemAnnouncementStore.getState(), 'cancel');
    render(<EventToast snapshot={mkSnapshot({ expiresAt: null })} />);
    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(cancelSpy).not.toHaveBeenCalled();
  });

  test('expiresAt 이 과거면 mount 즉시 cancel 호출', () => {
    (useLang as Mock).mockReturnValue(Language.Ko);
    const cancelSpy = vi.spyOn(useSystemAnnouncementStore.getState(), 'cancel');
    const expiresAt = new Date(NOW - 1_000).toISOString();
    render(<EventToast snapshot={mkSnapshot({ expiresAt })} />);
    expect(cancelSpy).toHaveBeenCalledWith(11);
  });
});
