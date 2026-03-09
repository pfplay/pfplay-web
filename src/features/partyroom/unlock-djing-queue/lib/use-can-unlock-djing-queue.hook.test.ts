vi.mock('@/shared/lib/store/stores.context');

import { renderHook } from '@testing-library/react';
import { createCurrentPartyroomStore } from '@/entities/current-partyroom/model/current-partyroom.store';
import { GradeType } from '@/shared/api/http/types/@enums';
import { useStores } from '@/shared/lib/store/stores.context';
import useCanUnlockDjingQueue from './use-can-unlock-djing-queue.hook';

let store: ReturnType<typeof createCurrentPartyroomStore>;

beforeEach(() => {
  vi.clearAllMocks();
  store = createCurrentPartyroomStore();
  (useStores as Mock).mockReturnValue({ useCurrentPartyroom: store });
});

describe('useCanUnlockDjingQueue', () => {
  test('me가 없으면 false를 반환한다', () => {
    const { result } = renderHook(() => useCanUnlockDjingQueue());
    expect(result.current).toBe(false);
  });

  test('MODERATOR는 대기열 잠금을 해제할 수 있다', () => {
    store.setState({ me: { gradeType: GradeType.MODERATOR } as any });
    const { result } = renderHook(() => useCanUnlockDjingQueue());
    expect(result.current).toBe(true);
  });

  test('LISTENER는 대기열 잠금을 해제할 수 없다', () => {
    store.setState({ me: { gradeType: GradeType.LISTENER } as any });
    const { result } = renderHook(() => useCanUnlockDjingQueue());
    expect(result.current).toBe(false);
  });
});
