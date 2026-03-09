vi.mock('@/shared/lib/store/stores.context');

import { renderHook } from '@testing-library/react';
import { createCurrentPartyroomStore } from '@/entities/current-partyroom/model/current-partyroom.store';
import { GradeType } from '@/shared/api/http/types/@enums';
import { useStores } from '@/shared/lib/store/stores.context';
import canViewPenalties from './use-can-view-penalties.hook';

let store: ReturnType<typeof createCurrentPartyroomStore>;

beforeEach(() => {
  vi.clearAllMocks();
  store = createCurrentPartyroomStore();
  (useStores as Mock).mockReturnValue({ useCurrentPartyroom: store });
});

describe('canViewPenalties', () => {
  test('me가 없으면 false를 반환한다', () => {
    const { result } = renderHook(() => canViewPenalties());
    expect(result.current).toBe(false);
  });

  test('MODERATOR는 패널티를 조회할 수 있다', () => {
    store.setState({ me: { gradeType: GradeType.MODERATOR } as any });
    const { result } = renderHook(() => canViewPenalties());
    expect(result.current).toBe(true);
  });

  test('HOST는 패널티를 조회할 수 있다', () => {
    store.setState({ me: { gradeType: GradeType.HOST } as any });
    const { result } = renderHook(() => canViewPenalties());
    expect(result.current).toBe(true);
  });

  test('CLUBBER는 패널티를 조회할 수 없다', () => {
    store.setState({ me: { gradeType: GradeType.CLUBBER } as any });
    const { result } = renderHook(() => canViewPenalties());
    expect(result.current).toBe(false);
  });
});
