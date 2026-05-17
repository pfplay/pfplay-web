vi.mock('@/entities/partyroom-client');
vi.mock('@/shared/lib/store/stores.context');
vi.mock('@/shared/lib/analytics/room-tracking', () => ({
  trackPartyroomExited: vi.fn(),
}));
vi.mock('../api/use-exit-partyroom.mutation');

import { renderHook, act } from '@testing-library/react';
import { usePartyroomClient } from '@/entities/partyroom-client';
import { trackPartyroomExited } from '@/shared/lib/analytics/room-tracking';
import { useStores } from '@/shared/lib/store/stores.context';
import { useTeardownPartyroom } from './use-teardown-partyroom';
import { useExitPartyroom as useExitPartyroomMutation } from '../api/use-exit-partyroom.mutation';

const mockMutate = vi.fn();
const mockUnsubscribe = vi.fn();
const mockReset = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  (usePartyroomClient as Mock).mockReturnValue({
    unsubscribeCurrentRoom: mockUnsubscribe,
  });
  (useStores as Mock).mockReturnValue({
    useCurrentPartyroom: (selector: (...args: any[]) => any) => selector({ reset: mockReset }),
  });
  (useExitPartyroomMutation as Mock).mockReturnValue({ mutate: mockMutate });
});

describe('useTeardownPartyroom (lib)', () => {
  test('클라 정리만 수행한다: unsubscribe + store reset + analytics', () => {
    const { result } = renderHook(() => useTeardownPartyroom(7));

    act(() => {
      result.current();
    });

    expect(mockUnsubscribe).toHaveBeenCalled();
    expect(mockReset).toHaveBeenCalled();
    expect(trackPartyroomExited).toHaveBeenCalledWith(7);
    expect(trackPartyroomExited).toHaveBeenCalledTimes(1);
  });

  test('백엔드 exit mutation은 절대 호출하지 않는다 (presence grace가 비자발적 이탈 처리)', () => {
    const { result } = renderHook(() => useTeardownPartyroom(7));

    act(() => {
      result.current();
    });

    expect(mockMutate).not.toHaveBeenCalled();
  });
});
