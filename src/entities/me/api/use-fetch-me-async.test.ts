import '@/shared/api/__test__/msw-server';
import { act } from '@testing-library/react';
import { renderWithClient } from '@/shared/api/__test__/test-utils';
import { QueryKeys } from '@/shared/api/http/query-keys';
import { useFetchMeAsync } from './use-fetch-me-async';

describe('useFetchMeAsync 통합', () => {
  test('fetchQuery 실행 후 Me 데이터를 반환한다', async () => {
    const { result } = renderWithClient(() => useFetchMeAsync());

    let meData: any;
    await act(async () => {
      meData = await result.current();
    });

    expect(meData).toHaveProperty('uid', 'user-123');
    expect(meData).toHaveProperty('nickname', 'TestUser');
  });

  test('캐시에 데이터가 저장된다', async () => {
    const { result, queryClient } = renderWithClient(() => useFetchMeAsync());

    await act(async () => {
      await result.current();
    });

    const cached = queryClient.getQueryData([QueryKeys.Me]);
    expect(cached).toBeDefined();
  });
});
