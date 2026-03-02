jest.mock('@/shared/lib/store/stores.context');

import { renderHook } from '@testing-library/react';
import { createCurrentPartyroomStore } from '@/entities/current-partyroom/model/current-partyroom.store';
import { GradeType } from '@/shared/api/http/types/@enums';
import { useStores } from '@/shared/lib/store/stores.context';
import useCanLockDjingQueue from './use-can-lock-djing-queue.hook';

let store: ReturnType<typeof createCurrentPartyroomStore>;

beforeEach(() => {
  jest.clearAllMocks();
  store = createCurrentPartyroomStore();
  (useStores as jest.Mock).mockReturnValue({ useCurrentPartyroom: store });
});

describe('useCanLockDjingQueue', () => {
  test('me가 없으면 false를 반환한다', () => {
    const { result } = renderHook(() => useCanLockDjingQueue());
    expect(result.current).toBe(false);
  });

  test('MODERATOR는 대기열을 잠글 수 있다', () => {
    store.setState({ me: { gradeType: GradeType.MODERATOR } as any });
    const { result } = renderHook(() => useCanLockDjingQueue());
    expect(result.current).toBe(true);
  });

  test('CLUBBER는 대기열을 잠글 수 없다', () => {
    store.setState({ me: { gradeType: GradeType.CLUBBER } as any });
    const { result } = renderHook(() => useCanLockDjingQueue());
    expect(result.current).toBe(false);
  });
});
