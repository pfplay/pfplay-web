import { waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '@/shared/api/__test__/msw-server';
import { renderWithClient } from '@/shared/api/__test__/test-utils';
import { QueryKeys } from '@/shared/api/http/query-keys';
import { useSearchMusics } from './use-search-musics.query';

describe('useSearchMusics integration (query → service → MSW)', () => {
  it('returns search results for a given keyword', async () => {
    const { result } = renderWithClient(
      (props: { search: string }) => useSearchMusics(props.search),
      {
        initialProps: { search: 'lofi' },
      }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const data = result.current.data;
    expect(data).toHaveLength(2);
    expect(data?.[0].videoTitle).toBe('lofi - Result 1');
    expect(data?.[1].videoId).toBe('def456');
  });

  it('does not fire query when search is empty (enabled: false)', async () => {
    const { result } = renderWithClient(
      (props: { search: string }) => useSearchMusics(props.search),
      {
        initialProps: { search: '' },
      }
    );

    // fetchStatus stays idle because the query is disabled
    await waitFor(() => expect(result.current.fetchStatus).toBe('idle'));
    expect(result.current.data).toBeUndefined();
  });

  it('uses cached results for the same search term', async () => {
    const { result, queryClient } = renderWithClient(
      (props: { search: string }) => useSearchMusics(props.search),
      { initialProps: { search: 'cached' } }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Cache should contain data for this key
    const cached = queryClient.getQueryData([QueryKeys.Musics, 'cached']);
    expect(cached).toBeDefined();
  });

  it('transitions to error state on API failure', async () => {
    server.use(
      http.get('http://localhost:8080/api/v1/music-search', () => {
        return HttpResponse.json(
          {
            data: {
              status: 'INTERNAL_SERVER_ERROR',
              code: 500,
              message: 'Server Error',
              errorCode: 'SYS-001',
            },
          },
          { status: 500 }
        );
      })
    );

    const { result } = renderWithClient(
      (props: { search: string }) => useSearchMusics(props.search),
      {
        initialProps: { search: 'fail-query' },
      }
    );

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error?.isAxiosError).toBe(true);
    expect(result.current.error?.response?.status).toBe(500);
  });
});
