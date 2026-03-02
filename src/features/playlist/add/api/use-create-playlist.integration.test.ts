/**
 * @jest-environment <rootDir>/src/shared/api/__test__/jest-msw-env.ts
 */
import { waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '@/shared/api/__test__/msw-server';
import { renderWithClient } from '@/shared/api/__test__/test-utils';
import errorEmitter from '@/shared/api/http/error/error-emitter';
import { QueryKeys } from '@/shared/api/http/query-keys';
import { useCreatePlaylist } from './use-create-playlist.mutation';

describe('useCreatePlaylist integration (hook → service → MSW)', () => {
  it('returns data on successful mutation', async () => {
    const { result } = renderWithClient(() => useCreatePlaylist());

    result.current.mutate({ name: 'My New Playlist' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual({
      id: 1,
      orderNumber: 1,
      name: 'My New Playlist',
      type: 'PLAYLIST',
    });
  });

  it('invalidates Playlist query cache on success', async () => {
    const { result, queryClient } = renderWithClient(() => useCreatePlaylist());

    // Seed the playlist cache
    queryClient.setQueryData([QueryKeys.Playlist], { playlists: [] });
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    result.current.mutate({ name: 'Cache Test' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: [QueryKeys.Playlist] })
    );
  });

  it('propagates AxiosError and emits errorCode on API failure', async () => {
    server.use(
      http.post('http://localhost:8080/api/v1/playlists', () => {
        return HttpResponse.json(
          {
            data: {
              status: 'BAD_REQUEST',
              code: 400,
              message: '재생목록 개수 제한을 초과함',
              errorCode: 'PLL-002',
            },
          },
          { status: 400 }
        );
      })
    );

    const emitted: string[] = [];
    const unsub = errorEmitter.on('PLL-002' as any, () => emitted.push('PLL-002'));

    const { result } = renderWithClient(() => useCreatePlaylist());

    result.current.mutate({ name: 'Over Limit' });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error?.isAxiosError).toBe(true);
    expect(result.current.error?.response?.status).toBe(400);
    expect(emitted).toContain('PLL-002');

    unsub();
  });

  it('transitions to idle → success after mutation', async () => {
    const { result } = renderWithClient(() => useCreatePlaylist());

    expect(result.current.isIdle).toBe(true);

    result.current.mutate({ name: 'Pending Test' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.isPending).toBe(false);
    expect(result.current.data).toBeDefined();
  });
});
