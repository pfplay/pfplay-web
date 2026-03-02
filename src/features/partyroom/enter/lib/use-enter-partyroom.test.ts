jest.mock('@/entities/partyroom-client');
jest.mock('@/shared/lib/store/stores.context');
jest.mock('@/shared/lib/router/use-app-router.hook');
jest.mock('../api/use-enter-partyroom.mutation');

import { renderHook, act } from '@testing-library/react';
import {
  usePartyroomClient,
  useHandlePartyroomSubscriptionEvent,
} from '@/entities/partyroom-client';
import { useAppRouter } from '@/shared/lib/router/use-app-router.hook';
import { useStores } from '@/shared/lib/store/stores.context';
import { useEnterPartyroom } from './use-enter-partyroom';
import { useEnterPartyroom as useEnterPartyroomMutation } from '../api/use-enter-partyroom.mutation';

const mockOnConnect = jest.fn();
const mockMutate = jest.fn();
const mockInit = jest.fn();
const mockMarkExitedOnBackend = jest.fn();
const mockPush = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (usePartyroomClient as jest.Mock).mockReturnValue({
    onConnect: mockOnConnect,
    subscribe: jest.fn(),
  });
  (useHandlePartyroomSubscriptionEvent as jest.Mock).mockReturnValue(jest.fn());
  (useStores as jest.Mock).mockReturnValue({
    useCurrentPartyroom: (selector: (...args: any[]) => any) =>
      selector({ init: mockInit, markExitedOnBackend: mockMarkExitedOnBackend }),
  });
  (useEnterPartyroomMutation as jest.Mock).mockReturnValue({ mutate: mockMutate });
  (useAppRouter as jest.Mock).mockReturnValue({ push: mockPush });
});

describe('useEnterPartyroom', () => {
  test('반환된 함수를 호출하면 client.onConnect를 등록한다', () => {
    const { result } = renderHook(() => useEnterPartyroom(1));

    act(() => {
      result.current();
    });

    expect(mockOnConnect).toHaveBeenCalledWith(expect.any(Function), { once: true });
  });

  test('onConnect 콜백이 실행되면 enter mutation을 호출한다', () => {
    const { result } = renderHook(() => useEnterPartyroom(42));

    act(() => {
      result.current();
    });

    // onConnect의 첫 번째 인자인 콜백을 실행
    const onConnectCallback = mockOnConnect.mock.calls[0][0];
    onConnectCallback();

    expect(mockMutate).toHaveBeenCalledWith(
      { partyroomId: 42 },
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      })
    );
  });

  test('enter 실패 시 markExitedOnBackend 호출 후 로비로 이동한다', () => {
    const { result } = renderHook(() => useEnterPartyroom(1));

    act(() => {
      result.current();
    });

    const onConnectCallback = mockOnConnect.mock.calls[0][0];
    onConnectCallback();

    // enter mutation의 onError 콜백 실행
    const mutateOptions = mockMutate.mock.calls[0][1];
    mutateOptions.onError();

    expect(mockMarkExitedOnBackend).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/parties');
  });
});
