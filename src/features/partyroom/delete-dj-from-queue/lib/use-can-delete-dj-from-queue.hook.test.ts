vi.mock('@/shared/lib/store/stores.context');

import { renderHook } from '@testing-library/react';
import { createCurrentPartyroomStore } from '@/entities/current-partyroom/model/current-partyroom.store';
import { GradeType } from '@/shared/api/http/types/@enums';
import { useStores } from '@/shared/lib/store/stores.context';
import useCanDeleteDjFromQueue from './use-can-delete-dj-from-queue.hook';

let store: ReturnType<typeof createCurrentPartyroomStore>;

beforeEach(() => {
  vi.clearAllMocks();
  store = createCurrentPartyroomStore();
  (useStores as Mock).mockReturnValue({ useCurrentPartyroom: store });
});

describe('useCanDeleteDjFromQueue', () => {
  test('me가 없으면 false를 반환한다', () => {
    const { result } = renderHook(() => useCanDeleteDjFromQueue());
    expect(result.current).toBe(false);
  });

  test('MODERATOR는 DJ를 대기열에서 삭제할 수 있다', () => {
    store.setState({ me: { gradeType: GradeType.MODERATOR } as any });
    const { result } = renderHook(() => useCanDeleteDjFromQueue());
    expect(result.current).toBe(true);
  });

  test('CLUBBER는 DJ를 대기열에서 삭제할 수 없다', () => {
    store.setState({ me: { gradeType: GradeType.CLUBBER } as any });
    const { result } = renderHook(() => useCanDeleteDjFromQueue());
    expect(result.current).toBe(false);
  });
});
