/**
 * @jest-environment <rootDir>/src/shared/api/__test__/jest-msw-env.ts
 */
import '@/shared/api/__test__/msw-server';
import { act, waitFor } from '@testing-library/react';
import { renderWithClient } from '@/shared/api/__test__/test-utils';
import { QueryKeys } from '@/shared/api/http/query-keys';
import { useUpdateMyBio } from './use-update-my-bio.mutation';

describe('useUpdateMyBio 통합', () => {
  test('성공 시 Me 캐시를 무효화한다', async () => {
    const { result, queryClient } = renderWithClient(() => useUpdateMyBio());
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries');

    await act(async () => {
      result.current.mutate({ nickname: 'NewName', introduction: 'Hello' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: [QueryKeys.Me],
    });
  });
});
