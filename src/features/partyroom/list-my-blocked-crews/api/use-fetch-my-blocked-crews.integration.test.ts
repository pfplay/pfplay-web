import '@/shared/api/__test__/msw-server';
import { waitFor } from '@testing-library/react';
import { renderWithClient } from '@/shared/api/__test__/test-utils';
import useFetchMyBlockedCrews from './use-fetch-my-blocked-crews.query';

describe('useFetchMyBlockedCrews 통합', () => {
  test('차단된 크루 목록을 반환한다', async () => {
    const { result } = renderWithClient(() => useFetchMyBlockedCrews());

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0]).toHaveProperty('nickname', 'BlockedUser');
  });

  test('enabled=false이면 쿼리가 실행되지 않는다', () => {
    const { result } = renderWithClient(() => useFetchMyBlockedCrews(false));
    expect(result.current.fetchStatus).toBe('idle');
  });
});
