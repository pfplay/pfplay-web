vi.mock('@/shared/lib/localization/i18n.context');
vi.mock('@/shared/ui/components/dialog');
vi.mock('./use-can-delete-dj-from-queue.hook');
vi.mock('../api/use-delete-dj-from-queue.mutation');

import { renderHook, act } from '@testing-library/react';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useDialog } from '@/shared/ui/components/dialog';
import useCanDeleteDjFromQueue from './use-can-delete-dj-from-queue.hook';
import useDeleteDjFromQueueHook from './use-delete-dj-from-queue.hook';
import useDeleteDjFromQueueMutation from '../api/use-delete-dj-from-queue.mutation';

const mockMutate = vi.fn();
const mockOpenConfirmDialog = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  (useI18n as Mock).mockReturnValue({ dj: { para: { delete_dj_queue: 'Delete DJ?' } } });
  (useDialog as Mock).mockReturnValue({ openConfirmDialog: mockOpenConfirmDialog });
  (useDeleteDjFromQueueMutation as Mock).mockReturnValue({ mutate: mockMutate });
});

describe('useDeleteDjFromQueue hook', () => {
  test('권한이 없으면 dialog를 열지 않는다', async () => {
    (useCanDeleteDjFromQueue as Mock).mockReturnValue(false);
    const { result } = renderHook(() => useDeleteDjFromQueueHook());

    await act(async () => {
      await result.current('dj-1');
    });

    expect(mockOpenConfirmDialog).not.toHaveBeenCalled();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  test('확인하면 djId로 mutate를 호출한다', async () => {
    (useCanDeleteDjFromQueue as Mock).mockReturnValue(true);
    mockOpenConfirmDialog.mockResolvedValue(true);
    const { result } = renderHook(() => useDeleteDjFromQueueHook());

    await act(async () => {
      await result.current('dj-1');
    });

    expect(mockMutate).toHaveBeenCalledWith('dj-1');
  });

  test('취소하면 mutate를 호출하지 않는다', async () => {
    (useCanDeleteDjFromQueue as Mock).mockReturnValue(true);
    mockOpenConfirmDialog.mockResolvedValue(false);
    const { result } = renderHook(() => useDeleteDjFromQueueHook());

    await act(async () => {
      await result.current('dj-1');
    });

    expect(mockMutate).not.toHaveBeenCalled();
  });
});
