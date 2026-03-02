jest.mock('@/shared/lib/store/stores.context');

import { renderHook } from '@testing-library/react';
import { createCurrentPartyroomStore } from '@/entities/current-partyroom/model/current-partyroom.store';
import { GradeType } from '@/shared/api/http/types/@enums';
import { useStores } from '@/shared/lib/store/stores.context';
import useCanEditCurrentPartyroom from './use-can-edit-current-partyroom.hook';

let store: ReturnType<typeof createCurrentPartyroomStore>;

beforeEach(() => {
  jest.clearAllMocks();
  store = createCurrentPartyroomStore();
  (useStores as jest.Mock).mockReturnValue({ useCurrentPartyroom: store });
});

describe('useCanEditCurrentPartyroom', () => {
  test('me가 없으면 false를 반환한다', () => {
    const { result } = renderHook(() => useCanEditCurrentPartyroom());
    expect(result.current).toBe(false);
  });

  test('HOST는 파티룸을 수정할 수 있다', () => {
    store.setState({ me: { gradeType: GradeType.HOST } as any });
    const { result } = renderHook(() => useCanEditCurrentPartyroom());
    expect(result.current).toBe(true);
  });

  test('MODERATOR는 파티룸을 수정할 수 없다', () => {
    store.setState({ me: { gradeType: GradeType.MODERATOR } as any });
    const { result } = renderHook(() => useCanEditCurrentPartyroom());
    expect(result.current).toBe(false);
  });
});
