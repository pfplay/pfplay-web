/**
 * @jest-environment <rootDir>/src/shared/api/__test__/jest-msw-env.ts
 */
import { waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { useAdjustGrade } from '@/features/partyroom/adjust-grade/api/use-adjust-grade.mutation';
import useCreatePartyroom from '@/features/partyroom/create/api/use-create-partyroom.mutation';
import { server } from '@/shared/api/__test__/msw-server';
import { renderWithClient } from '@/shared/api/__test__/test-utils';
import errorEmitter from '@/shared/api/http/error/error-emitter';
import { QueryKeys } from '@/shared/api/http/query-keys';
import { ErrorCode } from '@/shared/api/http/types/@shared';
import { useEnterPartyroom } from './use-enter-partyroom.mutation';

describe('Partyroom mutation integration (hook → service → MSW)', () => {
  describe('useEnterPartyroom', () => {
    it('returns crewId and gradeType on success', async () => {
      const { result } = renderWithClient(() => useEnterPartyroom());

      result.current.mutate({ partyroomId: 1 });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual({
        crewId: 99,
        gradeType: 'CLUBBER',
      });
    });

    it('propagates error and emits errorCode on API failure', async () => {
      server.use(
        http.post('http://localhost:8080/api/v1/partyrooms/:id/enter', () => {
          return HttpResponse.json(
            {
              data: {
                status: 'BAD_REQUEST',
                code: 400,
                message: '이미 다른 파티룸에 활성화되어 있음',
                errorCode: ErrorCode.ACTIVE_ANOTHER_ROOM,
              },
            },
            { status: 400 }
          );
        })
      );

      const emitted: string[] = [];
      const unsub = errorEmitter.on(ErrorCode.ACTIVE_ANOTHER_ROOM, () =>
        emitted.push(ErrorCode.ACTIVE_ANOTHER_ROOM)
      );

      const { result } = renderWithClient(() => useEnterPartyroom());

      result.current.mutate({ partyroomId: 999 });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error?.response?.status).toBe(400);
      expect(emitted).toContain(ErrorCode.ACTIVE_ANOTHER_ROOM);

      unsub();
    });
  });

  describe('useCreatePartyroom', () => {
    it('returns partyroomId on success', async () => {
      const { result } = renderWithClient(() => useCreatePartyroom());

      result.current.mutate({
        title: 'Test Room',
        introduction: 'Hello',
        playbackTimeLimit: 300,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual({ partyroomId: 42 });
    });
  });

  describe('useAdjustGrade', () => {
    it('resolves on success and invalidates Crews cache', async () => {
      const { result, queryClient } = renderWithClient(() => useAdjustGrade());

      queryClient.setQueryData([QueryKeys.Crews], []);
      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

      result.current.mutate({ partyroomId: 1, crewId: 99, gradeType: 'MANAGER' as any });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: [QueryKeys.Crews] })
      );
    });
  });
});
