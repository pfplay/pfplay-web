jest.mock('@/shared/lib/store/stores.context');

import { renderHook } from '@testing-library/react';
import { createCurrentPartyroomStore } from '@/entities/current-partyroom/model/current-partyroom.store';
import { GradeType } from '@/shared/api/http/types/@enums';
import { useStores } from '@/shared/lib/store/stores.context';
import useCanLiftPenalty from './use-can-lift-penalty.hook';

let store: ReturnType<typeof createCurrentPartyroomStore>;

beforeEach(() => {
  jest.clearAllMocks();
  store = createCurrentPartyroomStore();
  (useStores as jest.Mock).mockReturnValue({ useCurrentPartyroom: store });
});

describe('useCanLiftPenalty', () => {
  test('me가 없으면 항상 false를 반환한다', () => {
    const { result } = renderHook(() => useCanLiftPenalty());
    expect(result.current(GradeType.CLUBBER)).toBe(false);
  });

  test('HOST는 하위 등급의 패널티를 해제할 수 있다', () => {
    store.setState({ me: { gradeType: GradeType.HOST } as any });
    const { result } = renderHook(() => useCanLiftPenalty());

    expect(result.current(GradeType.MODERATOR)).toBe(true);
    expect(result.current(GradeType.CLUBBER)).toBe(true);
  });

  test('CLUBBER는 패널티 해제 권한이 없다', () => {
    store.setState({ me: { gradeType: GradeType.CLUBBER } as any });
    const { result } = renderHook(() => useCanLiftPenalty());
    expect(result.current(GradeType.LISTENER)).toBe(false);
  });
});
