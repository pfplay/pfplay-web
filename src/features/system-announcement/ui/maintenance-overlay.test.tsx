import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Mock, beforeEach, describe, expect, test, vi } from 'vitest';
import { Language } from '@/shared/lib/localization/constants';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useLang } from '@/shared/lib/localization/lang.context';
import MaintenanceOverlay from './maintenance-overlay';
import { MaintenanceState } from '../model/system-announcement.types';

vi.mock('@/shared/lib/localization/i18n.context', () => ({
  useI18n: vi.fn(),
}));
vi.mock('@/shared/lib/localization/lang.context', () => ({
  useLang: vi.fn(),
}));

const stubDict = {
  system: {
    maintenance: {
      active: { title: '점검 중', retry: '다시 시도' },
    },
  },
};

const MAINTENANCE: MaintenanceState = {
  phase: 'ACTIVE',
  startAt: '2026-05-04T03:00:00',
  endAt: '2026-05-04T04:00:00',
  messageKo: '한국어 메시지',
  messageEn: 'english message',
};

beforeEach(() => {
  vi.clearAllMocks();
  (useI18n as Mock).mockReturnValue(stubDict);
});

describe('MaintenanceOverlay', () => {
  test('locale ko면 messageKo가 표시된다', () => {
    (useLang as Mock).mockReturnValue(Language.Ko);
    render(<MaintenanceOverlay maintenance={MAINTENANCE} />);
    expect(screen.getByText('한국어 메시지')).toBeInTheDocument();
  });

  test('locale en이면 messageEn이 표시된다', () => {
    (useLang as Mock).mockReturnValue(Language.En);
    render(<MaintenanceOverlay maintenance={MAINTENANCE} />);
    expect(screen.getByText('english message')).toBeInTheDocument();
  });

  test('i18n title/retry 카피가 노출된다', () => {
    (useLang as Mock).mockReturnValue(Language.Ko);
    render(<MaintenanceOverlay maintenance={MAINTENANCE} />);
    expect(screen.getByText('점검 중')).toBeInTheDocument();
    expect(screen.getByText('다시 시도')).toBeInTheDocument();
  });

  test('재시도 버튼 클릭 시 window.location.reload가 호출된다', async () => {
    (useLang as Mock).mockReturnValue(Language.Ko);
    const reloadSpy = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { ...window.location, reload: reloadSpy },
      writable: true,
    });
    render(<MaintenanceOverlay maintenance={MAINTENANCE} />);
    await userEvent.click(screen.getByTestId('maintenance-overlay-retry'));
    expect(reloadSpy).toHaveBeenCalledOnce();
  });

  test('전체 화면 overlay 컨테이너가 렌더된다', () => {
    (useLang as Mock).mockReturnValue(Language.Ko);
    render(<MaintenanceOverlay maintenance={MAINTENANCE} />);
    const overlay = screen.getByTestId('maintenance-overlay');
    expect(overlay.className).toMatch(/fixed/);
    expect(overlay.className).toMatch(/inset-0/);
  });
});
