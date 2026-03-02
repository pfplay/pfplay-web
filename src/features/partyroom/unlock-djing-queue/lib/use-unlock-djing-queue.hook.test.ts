jest.mock('./use-can-unlock-djing-queue.hook');
jest.mock('../api/use-unlock-djing-queue.mutation');

import { renderHook, act } from '@testing-library/react';
import useCanUnlockDjingQueue from './use-can-unlock-djing-queue.hook';
import useUnlockDjingQueueHook from './use-unlock-djing-queue.hook';
import useUnlockDjingQueueMutation from '../api/use-unlock-djing-queue.mutation';

const mockMutate = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (useUnlockDjingQueueMutation as jest.Mock).mockReturnValue({ mutate: mockMutate });
});

describe('useUnlockDjingQueue hook', () => {
  test('권한이 없으면 mutate를 호출하지 않는다', async () => {
    (useCanUnlockDjingQueue as jest.Mock).mockReturnValue(false);
    const { result } = renderHook(() => useUnlockDjingQueueHook());

    await act(async () => {
      await result.current();
    });

    expect(mockMutate).not.toHaveBeenCalled();
  });

  test('권한이 있으면 mutate를 호출한다', async () => {
    (useCanUnlockDjingQueue as jest.Mock).mockReturnValue(true);
    const { result } = renderHook(() => useUnlockDjingQueueHook());

    await act(async () => {
      await result.current();
    });

    expect(mockMutate).toHaveBeenCalled();
  });
});
