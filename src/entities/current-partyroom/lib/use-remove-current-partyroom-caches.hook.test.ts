vi.mock('@/shared/lib/store/stores.context');

const mockRemoveQueries = vi.fn();
vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ removeQueries: mockRemoveQueries }),
}));

import { renderHook } from '@testing-library/react';
import { createCurrentPartyroomStore } from '@/entities/current-partyroom/model/current-partyroom.store';
import { QueryKeys } from '@/shared/api/http/query-keys';
import { useStores } from '@/shared/lib/store/stores.context';
import useRemoveCurrentPartyroomCaches from './use-remove-current-partyroom-caches.hook';

let store: ReturnType<typeof createCurrentPartyroomStore>;

beforeEach(() => {
  vi.clearAllMocks();
  store = createCurrentPartyroomStore();
  (useStores as Mock).mockReturnValue({ useCurrentPartyroom: store });
});

describe('useRemoveCurrentPartyroomCaches', () => {
  test('현재 파티룸 ID에 해당하는 5개 캐시가 모두 제거된다', () => {
    store.setState({ id: 42 });

    const { result } = renderHook(() => useRemoveCurrentPartyroomCaches());
    result.current();

    expect(mockRemoveQueries).toHaveBeenCalledTimes(5);
    expect(mockRemoveQueries).toHaveBeenCalledWith({ queryKey: [QueryKeys.DjingQueue, 42] });
    expect(mockRemoveQueries).toHaveBeenCalledWith({ queryKey: [QueryKeys.Crews, 42] });
    expect(mockRemoveQueries).toHaveBeenCalledWith({
      queryKey: [QueryKeys.PartyroomDetailSummary, 42],
    });
    expect(mockRemoveQueries).toHaveBeenCalledWith({ queryKey: [QueryKeys.PlaybackHistory, 42] });
    expect(mockRemoveQueries).toHaveBeenCalledWith({ queryKey: [QueryKeys.Penalties, 42] });
  });

  test('파티룸 ID가 undefined이면 undefined 키로 제거를 시도한다', () => {
    const { result } = renderHook(() => useRemoveCurrentPartyroomCaches());
    result.current();

    expect(mockRemoveQueries).toHaveBeenCalledTimes(5);
    expect(mockRemoveQueries).toHaveBeenCalledWith({
      queryKey: [QueryKeys.DjingQueue, undefined],
    });
  });
});
