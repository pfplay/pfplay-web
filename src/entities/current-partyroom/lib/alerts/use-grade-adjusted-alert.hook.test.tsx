vi.mock('@/shared/lib/store/stores.context');
vi.mock('@/shared/lib/localization/i18n.context');
vi.mock('@/shared/ui/components/dialog');

import { renderHook, act } from '@testing-library/react';
import { GradeType } from '@/shared/api/http/types/@enums';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useDialog } from '@/shared/ui/components/dialog';
import { useOpenGradeAdjustmentAlertDialog } from './use-grade-adjusted-alert.hook';

const mockOpenAlertDialog = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  (useI18n as Mock).mockReturnValue({
    auth: { para: { auth_changed: 'Authority Changed' } },
  });
  (useDialog as Mock).mockReturnValue({ openAlertDialog: mockOpenAlertDialog });
});

describe('useOpenGradeAdjustmentAlertDialog', () => {
  test('등급 변경 알림 다이얼로그를 연다', () => {
    const { result } = renderHook(() => useOpenGradeAdjustmentAlertDialog());

    act(() => {
      result.current(GradeType.CLUBBER, GradeType.MODERATOR);
    });

    expect(mockOpenAlertDialog).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Authority Changed' })
    );
  });
});
