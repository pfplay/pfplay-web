/**
 * @jest-environment <rootDir>/src/shared/api/__test__/jest-msw-env.ts
 */
import { http, HttpResponse } from 'msw';
import { server } from '@/shared/api/__test__/msw-server';
import { djsService, partyroomsService } from '@/shared/api/http/services';

describe('DjsService integration (axios → interceptors → MSW)', () => {
  describe('registerMeToQueue', () => {
    it('resolves without throwing on success', async () => {
      await djsService.registerMeToQueue({ partyroomId: 1, playlistId: 10 });
    });

    it('rejects with DJ-001 when already registered', async () => {
      server.use(
        http.post('http://localhost:8080/api/v1/partyrooms/:id/dj-queue', () => {
          return HttpResponse.json(
            {
              data: {
                status: 'BAD_REQUEST',
                code: 400,
                message: '이미 DJ로 등록됨',
                errorCode: 'DJ-001',
              },
            },
            { status: 400 }
          );
        })
      );

      try {
        await djsService.registerMeToQueue({ partyroomId: 1, playlistId: 10 });
        fail('Expected error');
      } catch (e: any) {
        expect(e.isAxiosError).toBe(true);
        expect(e.response.data.errorCode).toBe('DJ-001');
      }
    });

    it('rejects with DJ-002 when queue is closed', async () => {
      server.use(
        http.post('http://localhost:8080/api/v1/partyrooms/:id/dj-queue', () => {
          return HttpResponse.json(
            {
              data: {
                status: 'BAD_REQUEST',
                code: 400,
                message: 'DJ 대기열이 닫혀 있음',
                errorCode: 'DJ-002',
              },
            },
            { status: 400 }
          );
        })
      );

      try {
        await djsService.registerMeToQueue({ partyroomId: 1, playlistId: 10 });
        fail('Expected error');
      } catch (e: any) {
        expect(e.response.data.errorCode).toBe('DJ-002');
      }
    });

    it('rejects with DJ-003 when playlist is empty', async () => {
      server.use(
        http.post('http://localhost:8080/api/v1/partyrooms/:id/dj-queue', () => {
          return HttpResponse.json(
            {
              data: {
                status: 'BAD_REQUEST',
                code: 400,
                message: '비어있는 재생목록은 등록할 수 없음',
                errorCode: 'DJ-003',
              },
            },
            { status: 400 }
          );
        })
      );

      try {
        await djsService.registerMeToQueue({ partyroomId: 1, playlistId: 10 });
        fail('Expected error');
      } catch (e: any) {
        expect(e.response.data.errorCode).toBe('DJ-003');
      }
    });
  });

  describe('unregisterMeFromQueue', () => {
    it('resolves without throwing on success', async () => {
      await djsService.unregisterMeFromQueue({ partyroomId: 1 });
    });
  });

  describe('getPlaybackHistories', () => {
    it('returns unwrapped history list', async () => {
      const result = await djsService.getPlaybackHistories({ partyroomId: 1 });

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({ musicName: 'Song A', nickname: 'DJ One' });
    });
  });

  describe('cross-domain: DJ queue state after registration', () => {
    it('getDjingQueue returns queue with registered DJs', async () => {
      const queue = await partyroomsService.getDjingQueue({ partyroomId: 1 });

      expect(queue.queueStatus).toBe('OPEN');
      expect(queue.djs).toHaveLength(2);
      expect(queue.djs[0].nickname).toBe('DJ One');
    });
  });
});
