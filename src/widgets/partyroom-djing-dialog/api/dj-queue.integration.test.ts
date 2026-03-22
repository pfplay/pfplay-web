import { waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '@/shared/api/__test__/msw-server';
import { renderWithClient } from '@/shared/api/__test__/test-utils';
import errorEmitter from '@/shared/api/http/error/error-emitter';
import { QueryKeys } from '@/shared/api/http/query-keys';
import { ErrorCode } from '@/shared/api/http/types/@shared';
import { useRegisterMeToQueue } from './use-register-me-to-queue.mutation';
import { useUnregisterMeFromQueue } from './use-unregister-me-from-queue.mutation';

describe('DJ queue integration (hook → service → MSW)', () => {
  describe('useRegisterMeToQueue', () => {
    it('resolves on success and invalidates DjingQueue cache', async () => {
      const { result, queryClient } = renderWithClient(() => useRegisterMeToQueue());

      queryClient.setQueryData([QueryKeys.DjingQueue, 1], {});
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      result.current.mutate({ partyroomId: 1, playlistId: 10 });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: [QueryKeys.DjingQueue, 1] })
      );
    });

    it('propagates error and emits errorCode on API failure', async () => {
      server.use(
        http.post('http://localhost:8080/api/v1/partyrooms/:id/dj-queue', () => {
          return HttpResponse.json(
            {
              data: {
                status: 'BAD_REQUEST',
                code: 400,
                message: '이미 DJ로 등록됨',
                errorCode: ErrorCode.ALREADY_REGISTERED,
              },
            },
            { status: 400 }
          );
        })
      );

      const emitted: string[] = [];
      const unsub = errorEmitter.on(ErrorCode.ALREADY_REGISTERED, () =>
        emitted.push(ErrorCode.ALREADY_REGISTERED)
      );

      const { result } = renderWithClient(() => useRegisterMeToQueue());

      result.current.mutate({ partyroomId: 1, playlistId: 10 });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error?.response?.status).toBe(400);
      expect(emitted).toContain(ErrorCode.ALREADY_REGISTERED);

      unsub();
    });
  });

  describe('useUnregisterMeFromQueue', () => {
    it('resolves on success and invalidates DjingQueue cache', async () => {
      const { result, queryClient } = renderWithClient(() => useUnregisterMeFromQueue());

      queryClient.setQueryData([QueryKeys.DjingQueue, 1], {});
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      result.current.mutate({ partyroomId: 1 });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: [QueryKeys.DjingQueue, 1] })
      );
    });
  });
});
