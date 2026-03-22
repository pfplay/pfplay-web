vi.mock('@/shared/lib/store/stores.context');

import '@/shared/api/__test__/msw-server';
import { act, waitFor } from '@testing-library/react';
import { renderWithClient } from '@/shared/api/__test__/test-utils';
import { QueryKeys } from '@/shared/api/http/query-keys';
import { useStores } from '@/shared/lib/store/stores.context';
import useLockDjingQueue from './use-lock-djing-queue.mutation';
import useDeleteDjFromQueueMutation from '../../delete-dj-from-queue/api/use-delete-dj-from-queue.mutation';
import { useSkipPlayback } from '../../skip-playback/api/use-skip-playback.mutation';
import useUnlockDjingQueue from '../../unlock-djing-queue/api/use-unlock-djing-queue.mutation';

beforeEach(() => {
  vi.clearAllMocks();
  (useStores as Mock).mockReturnValue({
    useCurrentPartyroom: (selector: (...args: any[]) => any) => selector({ id: 1 }),
  });
});

describe('useLockDjingQueue 통합', () => {
  test('성공 시 DjingQueue 캐시를 무효화한다', async () => {
    const { result, queryClient } = renderWithClient(() => useLockDjingQueue());
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');

    await act(async () => {
      result.current.mutate();
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: [QueryKeys.DjingQueue, 1],
    });
  });
});

describe('useUnlockDjingQueue 통합', () => {
  test('성공 시 DjingQueue 캐시를 무효화한다', async () => {
    const { result, queryClient } = renderWithClient(() => useUnlockDjingQueue());
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');

    await act(async () => {
      result.current.mutate();
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: [QueryKeys.DjingQueue, 1],
    });
  });
});

describe('useDeleteDjFromQueueMutation 통합', () => {
  test('성공 시 DjingQueue 캐시를 무효화한다', async () => {
    const { result, queryClient } = renderWithClient(() => useDeleteDjFromQueueMutation());
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');

    await act(async () => {
      result.current.mutate('dj-123');
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: [QueryKeys.DjingQueue, 1],
    });
  });
});

describe('useSkipPlayback 통합', () => {
  test('성공 시 DjingQueue 캐시를 무효화한다', async () => {
    const { result, queryClient } = renderWithClient(() => useSkipPlayback());
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');

    await act(async () => {
      result.current.mutate({ partyroomId: 1 });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: [QueryKeys.DjingQueue, 1],
    });
  });
});
