vi.mock('@/shared/lib/store/stores.context');
vi.mock('@/shared/lib/localization/i18n.context');
vi.mock('@/shared/ui/components/dialog');
vi.mock('@/shared/lib/localization/renderer/index.ui', () => ({
  Trans: ({ i18nKey }: any) => <span>{i18nKey}</span>,
}));

import { renderHook, act } from '@testing-library/react';
import { PenaltyType } from '@/shared/api/http/types/@enums';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useDialog } from '@/shared/ui/components/dialog';
import usePenaltyAlert from './use-penalty-alert.hook';

const mockOpenDialog = vi.fn().mockResolvedValue(undefined);
let alertCallback: (...args: any[]) => void;

vi.mock('./use-alert.hook', () => ({
  __esModule: true,
  default: vi.fn((cb: (...args: any[]) => void) => {
    alertCallback = cb;
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  (useI18n as Mock).mockReturnValue({
    common: { para: { reason: 'Reason' }, btn: { confirm: 'Confirm' } },
  });
  (useDialog as Mock).mockReturnValue({ openDialog: mockOpenDialog });
  Object.defineProperty(window, 'location', {
    value: { href: '/' },
    writable: true,
  });
});

describe('usePenaltyAlert', () => {
  test('패널티 알림 메시지를 받으면 다이얼로그를 연다', async () => {
    renderHook(() => usePenaltyAlert());

    await act(async () => {
      alertCallback({ type: PenaltyType.CHAT_BAN_30_SECONDS, reason: 'spam' });
    });

    expect(mockOpenDialog).toHaveBeenCalled();
  });

  test('강제 퇴장 패널티면 클라이언트 백엔드 exit 없이 로비로 리다이렉트한다 (서버가 expel 처리)', async () => {
    renderHook(() => usePenaltyAlert());

    await act(async () => {
      alertCallback({ type: PenaltyType.ONE_TIME_EXPULSION, reason: 'rule violation' });
    });

    // 서버 측 expel이므로 클라이언트는 백엔드 exit을 호출하지 않고 로비로만 이동한다.
    expect(window.location.href).toBe('/parties');
  });

  test('등급 변경 메시지는 무시한다', async () => {
    renderHook(() => usePenaltyAlert());

    await act(async () => {
      alertCallback({ type: 'grade-adjusted', prev: 'CLUBBER', next: 'MODERATOR' });
    });

    expect(mockOpenDialog).not.toHaveBeenCalled();
  });
});
