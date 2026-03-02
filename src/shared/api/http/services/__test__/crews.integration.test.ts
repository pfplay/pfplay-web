/**
 * @jest-environment <rootDir>/src/shared/api/__test__/jest-msw-env.ts
 */
import { http, HttpResponse } from 'msw';
import { server } from '@/shared/api/__test__/msw-server';
import { crewsService } from '@/shared/api/http/services';

describe('CrewsService integration (axios → interceptors → MSW)', () => {
  describe('getBlockedCrews', () => {
    it('returns unwrapped blocked crew list', async () => {
      const result = await crewsService.getBlockedCrews();

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        blockId: 1,
        blockedCrewId: 55,
        nickname: 'BlockedUser',
      });
    });
  });

  describe('blockCrew', () => {
    it('resolves without throwing on success', async () => {
      await crewsService.blockCrew({ crewId: 42 });
    });

    it('rejects with BLK-002 on already blocked', async () => {
      server.use(
        http.post('http://localhost:8080/api/v1/crews/me/blocks', () => {
          return HttpResponse.json(
            {
              data: {
                status: 'BAD_REQUEST',
                code: 400,
                message: '이미 차단된 크루',
                errorCode: 'BLK-002',
              },
            },
            { status: 400 }
          );
        })
      );

      try {
        await crewsService.blockCrew({ crewId: 42 });
        fail('Expected error');
      } catch (e: any) {
        expect(e.isAxiosError).toBe(true);
        expect(e.response.data.errorCode).toBe('BLK-002');
      }
    });
  });

  describe('unblockCrew', () => {
    it('resolves without throwing on success', async () => {
      await crewsService.unblockCrew({ blockId: 1 });
    });

    it('rejects with BLK-001 when block not found', async () => {
      server.use(
        http.delete('http://localhost:8080/api/v1/crews/me/blocks/:blockId', () => {
          return HttpResponse.json(
            {
              data: {
                status: 'NOT_FOUND',
                code: 404,
                message: '차단 기록을 찾을 수 없음',
                errorCode: 'BLK-001',
              },
            },
            { status: 404 }
          );
        })
      );

      try {
        await crewsService.unblockCrew({ blockId: 999 });
        fail('Expected error');
      } catch (e: any) {
        expect(e.response.data.errorCode).toBe('BLK-001');
      }
    });
  });
});
