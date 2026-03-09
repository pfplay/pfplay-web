vi.mock('@/entities/current-partyroom', () => ({
  Crew: {
    Permission: {
      of: (_grade: string) => ({
        adjustableGrades: ['CLUBBER', 'LISTENER'],
      }),
    },
  },
  useOpenGradeAdjustmentAlertDialog: vi.fn(),
}));
vi.mock('../api/use-adjust-grade.mutation');
vi.mock('../api/use-can-adjust-grade.hook');
vi.mock('./use-select-grade.hook');
vi.mock('@/shared/lib/store/stores.context');

import { renderHook, act } from '@testing-library/react';
import { useOpenGradeAdjustmentAlertDialog } from '@/entities/current-partyroom';
import { GradeType } from '@/shared/api/http/types/@enums';
import { useStores } from '@/shared/lib/store/stores.context';
import { useAdjustGrade } from './use-adjust-grade.hook';
import { useSelectGrade } from './use-select-grade.hook';
import { useAdjustGrade as useAdjustGradeMutation } from '../api/use-adjust-grade.mutation';
import useCanAdjustGrade from '../api/use-can-adjust-grade.hook';

const mockMutate = vi.fn();
const mockSelectGrade = vi.fn();
const mockOpenAlert = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  (useAdjustGradeMutation as Mock).mockReturnValue({ mutate: mockMutate });
  (useSelectGrade as Mock).mockReturnValue(mockSelectGrade);
  (useOpenGradeAdjustmentAlertDialog as Mock).mockReturnValue(mockOpenAlert);
  (useStores as Mock).mockReturnValue({
    useCurrentPartyroom: (selector: (...args: any[]) => any) =>
      selector({ me: { crewId: 1, gradeType: GradeType.HOST }, id: 1 }),
  });
});

describe('useAdjustGrade', () => {
  test('권한 없으면 다이얼로그를 열지 않는다', async () => {
    (useCanAdjustGrade as Mock).mockReturnValue(() => false);

    const { result } = renderHook(() => useAdjustGrade());
    await act(async () => {
      await result.current({ crewId: 2, nickname: 'User', gradeType: GradeType.CLUBBER });
    });

    expect(mockSelectGrade).not.toHaveBeenCalled();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  test('같은 등급 선택 시 mutate를 호출하지 않는다', async () => {
    (useCanAdjustGrade as Mock).mockReturnValue(() => true);
    mockSelectGrade.mockResolvedValue(GradeType.CLUBBER);

    const { result } = renderHook(() => useAdjustGrade());
    await act(async () => {
      await result.current({ crewId: 2, nickname: 'User', gradeType: GradeType.CLUBBER });
    });

    expect(mockSelectGrade).toHaveBeenCalled();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  test('다른 등급 선택 시 mutate를 호출한다', async () => {
    (useCanAdjustGrade as Mock).mockReturnValue(() => true);
    mockSelectGrade.mockResolvedValue(GradeType.LISTENER);

    const { result } = renderHook(() => useAdjustGrade());
    await act(async () => {
      await result.current({ crewId: 2, nickname: 'User', gradeType: GradeType.CLUBBER });
    });

    expect(mockMutate).toHaveBeenCalledWith(
      { partyroomId: 1, crewId: 2, gradeType: GradeType.LISTENER },
      expect.objectContaining({ onSuccess: expect.any(Function) })
    );
  });

  test('mutate 성공 시 등급 변경 알림 다이얼로그를 연다', async () => {
    (useCanAdjustGrade as Mock).mockReturnValue(() => true);
    mockSelectGrade.mockResolvedValue(GradeType.LISTENER);
    mockMutate.mockImplementation((_payload: any, options: any) => {
      options.onSuccess();
    });

    const { result } = renderHook(() => useAdjustGrade());
    await act(async () => {
      await result.current({ crewId: 2, nickname: 'User', gradeType: GradeType.CLUBBER });
    });

    expect(mockOpenAlert).toHaveBeenCalledWith(GradeType.CLUBBER, GradeType.LISTENER);
  });
});
