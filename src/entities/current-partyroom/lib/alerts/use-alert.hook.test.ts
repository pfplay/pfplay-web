vi.mock('@/shared/lib/store/stores.context');

import { renderHook } from '@testing-library/react';
import { useStores } from '@/shared/lib/store/stores.context';
import useAlert from './use-alert.hook';

const mockSubscribe = vi.fn();
const mockUnsubscribe = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  (useStores as Mock).mockReturnValue({
    useCurrentPartyroom: (selector: (...args: any[]) => any) =>
      selector({ alert: { subscribe: mockSubscribe, unsubscribe: mockUnsubscribe } }),
  });
});

describe('useAlert', () => {
  test('마운트 시 callback을 subscribe한다', () => {
    const callback = vi.fn();
    renderHook(() => useAlert(callback));

    expect(mockSubscribe).toHaveBeenCalledWith(callback);
  });

  test('언마운트 시 callback을 unsubscribe한다', () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useAlert(callback));

    unmount();
    expect(mockUnsubscribe).toHaveBeenCalledWith(callback);
  });
});
