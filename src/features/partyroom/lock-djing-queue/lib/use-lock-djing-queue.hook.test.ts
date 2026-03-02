jest.mock('@/shared/lib/localization/i18n.context');
jest.mock('@/shared/ui/components/dialog');
jest.mock('./use-can-lock-djing-queue.hook');
jest.mock('../api/use-lock-djing-queue.mutation');

import { renderHook, act } from '@testing-library/react';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useDialog } from '@/shared/ui/components/dialog';
import useCanLockDjingQueue from './use-can-lock-djing-queue.hook';
import useLockDjingQueueHook from './use-lock-djing-queue.hook';
import useLockDjingQueueMutation from '../api/use-lock-djing-queue.mutation';

const mockMutate = jest.fn();
const mockOpenConfirmDialog = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (useI18n as jest.Mock).mockReturnValue({ dj: { para: { lock_dj_queue: 'Lock?' } } });
  (useDialog as jest.Mock).mockReturnValue({ openConfirmDialog: mockOpenConfirmDialog });
  (useLockDjingQueueMutation as jest.Mock).mockReturnValue({ mutate: mockMutate });
});

describe('useLockDjingQueue hook', () => {
  test('권한이 없으면 dialog를 열지 않는다', async () => {
    (useCanLockDjingQueue as jest.Mock).mockReturnValue(false);
    const { result } = renderHook(() => useLockDjingQueueHook());

    await act(async () => {
      await result.current();
    });

    expect(mockOpenConfirmDialog).not.toHaveBeenCalled();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  test('확인하면 mutate를 호출한다', async () => {
    (useCanLockDjingQueue as jest.Mock).mockReturnValue(true);
    mockOpenConfirmDialog.mockResolvedValue(true);
    const { result } = renderHook(() => useLockDjingQueueHook());

    await act(async () => {
      await result.current();
    });

    expect(mockOpenConfirmDialog).toHaveBeenCalledWith({ content: 'Lock?' });
    expect(mockMutate).toHaveBeenCalled();
  });

  test('취소하면 mutate를 호출하지 않는다', async () => {
    (useCanLockDjingQueue as jest.Mock).mockReturnValue(true);
    mockOpenConfirmDialog.mockResolvedValue(false);
    const { result } = renderHook(() => useLockDjingQueueHook());

    await act(async () => {
      await result.current();
    });

    expect(mockMutate).not.toHaveBeenCalled();
  });
});
