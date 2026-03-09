import { waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '@/shared/api/__test__/msw-server';
import { renderWithClient } from '@/shared/api/__test__/test-utils';
import errorEmitter from '@/shared/api/http/error/error-emitter';
import { useFetchMe } from './use-fetch-me.query';

describe('useFetchMe integration (query → usersService → MSW)', () => {
  it('returns combined me info + profile summary', async () => {
    const { result } = renderWithClient(() => useFetchMe());

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const data = result.current.data;
    expect(data?.uid).toBe('user-123');
    expect(data?.email).toBe('test@pfplay.io');
    expect(data?.authorityTier).toBe('FM');
    expect(data?.nickname).toBe('TestUser');
    expect(data?.avatarBodyUri).toBe('https://example.com/body.png');
  });

  it('transitions to error state on 401 auth error', async () => {
    server.use(
      http.get('http://localhost:8080/api/v1/users/me/info', () => {
        return HttpResponse.json(
          {
            data: {
              status: 'UNAUTHORIZED',
              code: 401,
              message: 'ACCESS_TOKEN 을 찾을 수 없음',
              errorCode: 'JWT-001',
            },
          },
          { status: 401 }
        );
      })
    );

    const { result } = renderWithClient(() => useFetchMe());

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error?.isAxiosError).toBe(true);
    expect(result.current.error?.response?.status).toBe(401);
  });

  it('emits errorCode via errorEmitter on API error', async () => {
    server.use(
      http.get('http://localhost:8080/api/v1/users/me/info', () => {
        return HttpResponse.json(
          {
            data: {
              status: 'UNAUTHORIZED',
              code: 401,
              message: 'ACCESS_TOKEN 이 만료됨',
              errorCode: 'JWT-003',
            },
          },
          { status: 401 }
        );
      })
    );

    const emitted: string[] = [];
    const unsub = errorEmitter.on('JWT-003' as any, () => emitted.push('JWT-003'));

    const { result } = renderWithClient(() => useFetchMe());

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(emitted).toContain('JWT-003');

    unsub();
  });
});
