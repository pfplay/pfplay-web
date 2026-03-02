jest.mock('@/shared/lib/store/stores.context');

import { renderHook } from '@testing-library/react';
import { createCurrentPartyroomStore } from '@/entities/current-partyroom/model/current-partyroom.store';
import { GradeType } from '@/shared/api/http/types/@enums';
import { useStores } from '@/shared/lib/store/stores.context';
import useCanAdjustGrade from './use-can-adjust-grade.hook';

let store: ReturnType<typeof createCurrentPartyroomStore>;

beforeEach(() => {
  jest.clearAllMocks();
  store = createCurrentPartyroomStore();
  (useStores as jest.Mock).mockReturnValue({ useCurrentPartyroom: store });
});

describe('useCanAdjustGrade', () => {
  test('me가 없으면 항상 false를 반환한다', () => {
    const { result } = renderHook(() => useCanAdjustGrade());
    expect(result.current(GradeType.CLUBBER)).toBe(false);
  });

  test('HOST는 하위 등급을 조정할 수 있다', () => {
    store.setState({ me: { gradeType: GradeType.HOST } as any });
    const { result } = renderHook(() => useCanAdjustGrade());

    expect(result.current(GradeType.MODERATOR)).toBe(true);
    expect(result.current(GradeType.CLUBBER)).toBe(true);
    expect(result.current(GradeType.LISTENER)).toBe(true);
  });

  test('HOST는 자기 등급을 조정할 수 없다', () => {
    store.setState({ me: { gradeType: GradeType.HOST } as any });
    const { result } = renderHook(() => useCanAdjustGrade());
    expect(result.current(GradeType.HOST)).toBe(false);
  });

  test('CLUBBER는 등급 조정 권한이 없다', () => {
    store.setState({ me: { gradeType: GradeType.CLUBBER } as any });
    const { result } = renderHook(() => useCanAdjustGrade());
    expect(result.current(GradeType.LISTENER)).toBe(false);
  });

  test('MODERATOR는 하위 등급만 조정할 수 있다', () => {
    store.setState({ me: { gradeType: GradeType.MODERATOR } as any });
    const { result } = renderHook(() => useCanAdjustGrade());

    expect(result.current(GradeType.CLUBBER)).toBe(true);
    expect(result.current(GradeType.MODERATOR)).toBe(false);
    expect(result.current(GradeType.HOST)).toBe(false);
  });
});
