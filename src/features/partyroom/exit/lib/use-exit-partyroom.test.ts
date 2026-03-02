jest.mock('@/entities/partyroom-client');
jest.mock('@/shared/lib/store/stores.context');
jest.mock('../api/use-exit-partyroom.mutation');

import { renderHook, act } from '@testing-library/react';
import { usePartyroomClient } from '@/entities/partyroom-client';
import { useStores } from '@/shared/lib/store/stores.context';
import { useExitPartyroom } from './use-exit-partyroom';
import { useExitPartyroom as useExitPartyroomMutation } from '../api/use-exit-partyroom.mutation';

const mockMutate = jest.fn();
const mockUnsubscribe = jest.fn();
const mockReset = jest.fn();
const mockGetState = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (usePartyroomClient as jest.Mock).mockReturnValue({
    unsubscribeCurrentRoom: mockUnsubscribe,
  });
  mockGetState.mockReturnValue({ exitedOnBackend: false });
  (useStores as jest.Mock).mockReturnValue({
    useCurrentPartyroom: Object.assign(
      (selector: (...args: any[]) => any) => selector({ reset: mockReset }),
      { getState: mockGetState }
    ),
  });
  (useExitPartyroomMutation as jest.Mock).mockReturnValue({ mutate: mockMutate });
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
});
