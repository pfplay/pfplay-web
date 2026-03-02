jest.mock('@/shared/lib/localization/i18n.context');
jest.mock('@/shared/ui/components/dialog');
jest.mock('@/shared/lib/store/stores.context');
jest.mock('../api/use-can-impose-penalty.hook');

import { renderHook } from '@testing-library/react';
import { GradeType, PenaltyType } from '@/shared/api/http/types/@enums';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useStores } from '@/shared/lib/store/stores.context';
import { useDialog } from '@/shared/ui/components/dialog';
import useImposePenalty from './use-impose-penalty.hook';
import useCanImposePenalty from '../api/use-can-impose-penalty.hook';

const mockOpenDialog = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (useI18n as jest.Mock).mockReturnValue({
    chat: { para: { reason_shared: 'Enter reason' } },
    common: { btn: { cancel: 'Cancel', confirm: 'Confirm' } },
  });
  (useDialog as jest.Mock).mockReturnValue({ openDialog: mockOpenDialog });
});

describe('useImposePenalty', () => {
  test('partyroomId가 없으면 다이얼로그를 열지 않는다', () => {
    (useStores as jest.Mock).mockReturnValue({
      useCurrentPartyroom: (selector: (...args: any[]) => any) => selector({ id: null }),
    });
    (useCanImposePenalty as jest.Mock).mockReturnValue(() => true);

    const { result } = renderHook(() => useImposePenalty());
    result.current({
      crewId: 1,
      nickname: 'User',
      crewGradeType: GradeType.CLUBBER,
      penaltyType: PenaltyType.CHAT_BAN_30_SECONDS,
    });

    expect(mockOpenDialog).not.toHaveBeenCalled();
  });

  test('권한이 없으면 다이얼로그를 열지 않는다', () => {
    (useStores as jest.Mock).mockReturnValue({
      useCurrentPartyroom: (selector: (...args: any[]) => any) => selector({ id: 1 }),
    });
    (useCanImposePenalty as jest.Mock).mockReturnValue(() => false);

    const { result } = renderHook(() => useImposePenalty());
    result.current({
      crewId: 1,
      nickname: 'User',
      crewGradeType: GradeType.CLUBBER,
      penaltyType: PenaltyType.CHAT_BAN_30_SECONDS,
    });

    expect(mockOpenDialog).not.toHaveBeenCalled();
  });

  test('권한이 있으면 다이얼로그를 연다', () => {
    (useStores as jest.Mock).mockReturnValue({
      useCurrentPartyroom: (selector: (...args: any[]) => any) => selector({ id: 1 }),
    });
    (useCanImposePenalty as jest.Mock).mockReturnValue(() => true);

    const { result } = renderHook(() => useImposePenalty());
    result.current({
      crewId: 1,
      nickname: 'User',
      crewGradeType: GradeType.CLUBBER,
      penaltyType: PenaltyType.CHAT_BAN_30_SECONDS,
    });

    expect(mockOpenDialog).toHaveBeenCalled();
  });
});
