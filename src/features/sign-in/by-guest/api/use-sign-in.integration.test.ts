import '@/shared/api/__test__/msw-server';
import { act, waitFor } from '@testing-library/react';
import { renderWithClient } from '@/shared/api/__test__/test-utils';
import useSignIn from './use-sign-in.mutation';

describe('useSignIn (게스트) 통합', () => {
  test('게스트 로그인 성공', async () => {
    const { result } = renderWithClient(() => useSignIn());

    await act(async () => {
      result.current.mutate();
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
