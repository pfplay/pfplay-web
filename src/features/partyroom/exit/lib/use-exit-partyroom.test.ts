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
import { useExitPartyroom } from './use-exit-partyroom';
import { useExitPartyroom as useExitPartyroomMutation } from '../api/use-exit-partyroom.mutation';

const mockMutate = vi.fn();
const mockUnsubscribe = vi.fn();
const mockReset = vi.fn();
const mockGetState = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  (usePartyroomClient as Mock).mockReturnValue({
    unsubscribeCurrentRoom: mockUnsubscribe,
  });
  mockGetState.mockReturnValue({ exitedOnBackend: false });
  (useStores as Mock).mockReturnValue({
    useCurrentPartyroom: Object.assign(
      (selector: (...args: any[]) => any) => selector({ reset: mockReset }),
      { getState: mockGetState }
    ),
  });
  (useExitPartyroomMutation as Mock).mockReturnValue({ mutate: mockMutate });
});

describe('useExitPartyroom (lib)', () => {
  test('exitedOnBackend=false이면 exit mutation을 호출한다', () => {
    const { result } = renderHook(() => useExitPartyroom(1));

    act(() => {
      result.current();
    });

    expect(mockMutate).toHaveBeenCalledWith({ partyroomId: 1 });
    expect(mockUnsubscribe).toHaveBeenCalled();
    expect(mockReset).toHaveBeenCalled();
  });

  test('exitedOnBackend=true이면 exit mutation을 호출하지 않는다', () => {
    mockGetState.mockReturnValue({ exitedOnBackend: true });
    const { result } = renderHook(() => useExitPartyroom(1));

    act(() => {
      result.current();
    });

    expect(mockMutate).not.toHaveBeenCalled();
    expect(mockUnsubscribe).toHaveBeenCalled();
    expect(mockReset).toHaveBeenCalled();
  });

  test('exit 호출 시 trackPartyroomExited 1회 발화 (분석 회귀 방지)', () => {
    const { result } = renderHook(() => useExitPartyroom(42));

    act(() => {
      result.current();
    });

    expect(trackPartyroomExited).toHaveBeenCalledWith(42);
    expect(trackPartyroomExited).toHaveBeenCalledTimes(1);
  });
});
