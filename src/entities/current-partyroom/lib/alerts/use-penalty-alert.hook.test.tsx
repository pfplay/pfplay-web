jest.mock('@/shared/lib/store/stores.context');
jest.mock('@/shared/lib/localization/i18n.context');
jest.mock('@/shared/ui/components/dialog');
jest.mock('@/shared/lib/localization/renderer/index.ui', () => ({
  Trans: ({ i18nKey }: any) => <span>{i18nKey}</span>,
}));

import { renderHook, act } from '@testing-library/react';
import { PenaltyType } from '@/shared/api/http/types/@enums';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useStores } from '@/shared/lib/store/stores.context';
import { useDialog } from '@/shared/ui/components/dialog';
import usePenaltyAlert from './use-penalty-alert.hook';

const mockOpenDialog = jest.fn().mockResolvedValue(undefined);
const mockMarkExitedOnBackend = jest.fn();
let alertCallback: (...args: any[]) => void;

jest.mock('./use-alert.hook', () => ({
  __esModule: true,
  default: jest.fn((cb: (...args: any[]) => void) => {
    alertCallback = cb;
  }),
}));

beforeEach(() => {
  jest.clearAllMocks();
  (useI18n as jest.Mock).mockReturnValue({
    common: { para: { reason: 'Reason' }, btn: { confirm: 'Confirm' } },
  });
  (useDialog as jest.Mock).mockReturnValue({ openDialog: mockOpenDialog });
  (useStores as jest.Mock).mockReturnValue({
    useCurrentPartyroom: (selector: (...args: any[]) => any) =>
      selector({ markExitedOnBackend: mockMarkExitedOnBackend }),
  });
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

  test('강제 퇴장 패널티면 markExitedOnBackend를 호출한다', async () => {
    renderHook(() => usePenaltyAlert());

    await act(async () => {
      alertCallback({ type: PenaltyType.ONE_TIME_EXPULSION, reason: 'rule violation' });
    });

    expect(mockMarkExitedOnBackend).toHaveBeenCalled();
  });

  test('등급 변경 메시지는 무시한다', async () => {
    renderHook(() => usePenaltyAlert());

    await act(async () => {
      alertCallback({ type: 'grade-adjusted', prev: 'CLUBBER', next: 'MODERATOR' });
    });

    expect(mockOpenDialog).not.toHaveBeenCalled();
  });
});
