import { act, renderHook } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import useMobileUnregisterMeFromQueue from './use-unregister-me-from-queue.hook';

const confirmMock = vi.fn();
vi.mock('@/shared/ui/components/dialog', () => ({
  useDialog: () => ({ openConfirmDialog: confirmMock, openAlertDialog: vi.fn() }),
}));

const unregisterMutate = vi.fn();
vi.mock('@/features/partyroom/unregister-me-from-queue', () => ({
  useUnregisterMeFromQueue: () => ({ mutate: unregisterMutate, isPending: false }),
}));

vi.mock('@/shared/lib/localization/i18n.context', () => ({
  useI18n: () => ({
    partyroom: {
      queue: {
        unregister_confirm: '정말 큐에서 나가시겠어요?',
      },
    },
  }),
}));

describe('useMobileUnregisterMeFromQueue', () => {
  test('confirm 취소 시 mutation 미호출', async () => {
    confirmMock.mockResolvedValue(false);
    const { result } = renderHook(() => useMobileUnregisterMeFromQueue({ partyroomId: 1 }));
    await act(async () => {
      await result.current();
    });
    expect(unregisterMutate).not.toHaveBeenCalled();
  });

  test('정상 → unregisterMutate({partyroomId})', async () => {
    confirmMock.mockResolvedValue(true);
    const { result } = renderHook(() => useMobileUnregisterMeFromQueue({ partyroomId: 1 }));
    await act(async () => {
      await result.current();
    });
    expect(unregisterMutate).toHaveBeenCalledWith({ partyroomId: 1 });
  });
});
