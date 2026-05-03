import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Mock, beforeEach, describe, expect, test, vi } from 'vitest';
import { Language } from '@/shared/lib/localization/constants';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useLang } from '@/shared/lib/localization/lang.context';
import MaintenancePlannedBanner from './maintenance-planned-banner';
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
    maintenance: {
      planned: { banner: '{{start}} 부터 점검 예정' },
    },
    announcement: {
      event: { close: '닫기' },
    },
  },
};
const stubDictEn = {
  system: {
    maintenance: {
      planned: { banner: 'Maintenance scheduled from {{start}}' },
    },
    announcement: {
      event: { close: 'Close' },
    },
  },
};

const SNAPSHOT: AnnouncementSnapshot = {
  announcementId: 42,
  type: 'MAINTENANCE_NOTICE',
  severity: 'WARN',
  titleKo: '점검 예고',
  titleEn: 'Maintenance Notice',
  messageKo: '점검 안내',
  messageEn: 'Notice',
  scheduledStartAt: '2026-05-04T03:00:00',
  scheduledEndAt: '2026-05-04T04:00:00',
  expiresAt: null,
  sentAt: '2026-05-03T15:00:00',
};

beforeEach(() => {
  vi.clearAllMocks();
  useSystemAnnouncementStore.setState({
    announcements: new Map([[42, SNAPSHOT]]),
    dismissedIds: new Set(),
    maintenance: null,
  });
});

describe('MaintenancePlannedBanner', () => {
  test('locale ko면 {{start}}가 formatScheduledTime 결과로 치환된다', () => {
    (useI18n as Mock).mockReturnValue(stubDict);
    (useLang as Mock).mockReturnValue(Language.Ko);
    render(<MaintenancePlannedBanner snapshot={SNAPSHOT} />);
    expect(screen.getByText('2026-05-04 03:00 부터 점검 예정')).toBeInTheDocument();
  });

  test('locale en이면 영어 카피로 동일하게 치환된다', () => {
    (useI18n as Mock).mockReturnValue(stubDictEn);
    (useLang as Mock).mockReturnValue(Language.En);
    render(<MaintenancePlannedBanner snapshot={SNAPSHOT} />);
    expect(screen.getByText('Maintenance scheduled from 2026-05-04 03:00')).toBeInTheDocument();
  });

  test('close 버튼 클릭 시 store.dismiss(announcementId)가 호출된다', async () => {
    (useI18n as Mock).mockReturnValue(stubDict);
    (useLang as Mock).mockReturnValue(Language.Ko);
    const dismissSpy = vi.spyOn(useSystemAnnouncementStore.getState(), 'dismiss');
    render(<MaintenancePlannedBanner snapshot={SNAPSHOT} />);
    await userEvent.click(screen.getByTestId('maintenance-planned-banner-close'));
    expect(dismissSpy).toHaveBeenCalledWith(42);
  });

  test('scheduledStartAt이 null이면 컴포넌트가 null 반환', () => {
    (useI18n as Mock).mockReturnValue(stubDict);
    (useLang as Mock).mockReturnValue(Language.Ko);
    const { container } = render(
      <MaintenancePlannedBanner snapshot={{ ...SNAPSHOT, scheduledStartAt: null }} />
    );
    expect(container.firstChild).toBeNull();
  });
});
