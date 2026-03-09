import '@/shared/api/__test__/msw-server';
import { act, waitFor } from '@testing-library/react';
import { renderWithClient } from '@/shared/api/__test__/test-utils';
import { QueryKeys } from '@/shared/api/http/query-keys';
import useUpdateMyWallet from './use-update-my-wallet.mutation';

describe('useUpdateMyWallet 통합', () => {
  test('성공 시 Me 캐시를 무효화한다', async () => {
    const { result, queryClient } = renderWithClient(() => useUpdateMyWallet());
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');

    await act(async () => {
      result.current.mutate({ walletAddress: '0xABC' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: [QueryKeys.Me],
    });
  });
});
