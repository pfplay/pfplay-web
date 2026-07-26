import { waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '@/shared/api/__test__/msw-server';
import { renderWithClient } from '@/shared/api/__test__/test-utils';
import { QueryKeys } from '@/shared/api/http/query-keys';
import { useQuickRegisterMeToQueue } from './use-quick-register-me-to-queue.mutation';

const TRACK = {
  name: "BLACKPINK - 'Shut Down' M/V",
  linkId: 'POe9SOEKotk',
  duration: '03:01',
  thumbnailImage: 'https://i.ytimg.com/vi/POe9SOEKotk/mqdefault.jpg',
};

describe('useQuickRegisterMeToQueue integration (hook → service → MSW)', () => {
  it('partyroomId 를 뺀 트랙 4개 필드만 body 로 보낸다', async () => {
    let requestBody: unknown;
    server.use(
      http.post(
        'http://localhost:8080/api/v1/partyrooms/:id/dj-queue/quick',
        async ({ request }) => {
          requestBody = await request.json();
          return new HttpResponse(null, { status: 201 });
        }
      )
    );

    const { result } = renderWithClient(() => useQuickRegisterMeToQueue());

    result.current.mutate({ partyroomId: 1, ...TRACK });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(requestBody).toEqual(TRACK);
  });

  it('성공 시 DjingQueue 와 Playlist 캐시를 무효화한다', async () => {
    const { result, queryClient } = renderWithClient(() => useQuickRegisterMeToQueue());

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    result.current.mutate({ partyroomId: 1, ...TRACK });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: [QueryKeys.DjingQueue, 1] })
    );
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: [QueryKeys.Playlist] })
    );
  });
});
