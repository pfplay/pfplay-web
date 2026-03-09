import '@/shared/api/__test__/msw-server';
import { act, waitFor } from '@testing-library/react';
import { renderWithClient } from '@/shared/api/__test__/test-utils';
import { QueryKeys } from '@/shared/api/http/query-keys';
import usePrefetchMe from './use-prefetch-me.query';

describe('usePrefetchMe 통합', () => {
  test('prefetch 실행 후 Me 캐시에 데이터가 채워진다', async () => {
    const { result, queryClient } = renderWithClient(() => usePrefetchMe());

    await act(async () => {
      await result.current();
    });

    await waitFor(() => {
      const cached = queryClient.getQueryData([QueryKeys.Me]);
      expect(cached).toBeDefined();
    });

    const cached = queryClient.getQueryData<any>([QueryKeys.Me]);
    expect(cached).toHaveProperty('uid');
    expect(cached).toHaveProperty('nickname');
  });
});
