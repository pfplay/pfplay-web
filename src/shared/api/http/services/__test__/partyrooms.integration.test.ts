/**
 * @jest-environment <rootDir>/src/shared/api/__test__/jest-msw-env.ts
 */
import { http, HttpResponse } from 'msw';
import { server } from '@/shared/api/__test__/msw-server';
import { partyroomsService } from '@/shared/api/http/services';

describe('PartyroomsService integration (axios → interceptors → MSW)', () => {
  describe('create', () => {
    it('returns unwrapped partyroomId on success', async () => {
      const result = await partyroomsService.create({
        title: 'Test Room',
        introduction: 'Hello',
        playbackTimeLimit: 300,
      });

      expect(result).toEqual({ partyroomId: 42 });
    });
  });

  describe('getList', () => {
    it('returns unwrapped partyroom list', async () => {
      const result = await partyroomsService.getList();

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        partyroomId: 1,
        stageType: 'MAIN',
        title: 'Main Stage',
      });
    });
  });

  describe('enter', () => {
    it('returns crewId and gradeType on success', async () => {
      const result = await partyroomsService.enter({ partyroomId: 1 });

      expect(result).toEqual({ crewId: 99, gradeType: 'CLUBBER' });
    });

    it('rejects with PTR-003 on capacity exceeded', async () => {
      server.use(
        http.post('http://localhost:8080/api/v1/partyrooms/:id/crews', () => {
          return HttpResponse.json(
            {
              data: {
                status: 'BAD_REQUEST',
                code: 400,
                message: '파티룸 정원 초과',
                errorCode: 'PTR-003',
              },
            },
            { status: 400 }
          );
        })
      );

      try {
        await partyroomsService.enter({ partyroomId: 1 });
        fail('Expected error');
      } catch (e: any) {
        expect(e.isAxiosError).toBe(true);
        expect(e.response.status).toBe(400);
        expect(e.response.data.errorCode).toBe('PTR-003');
      }
    });

    it('rejects with PTR-001 when room not found', async () => {
      server.use(
        http.post('http://localhost:8080/api/v1/partyrooms/:id/crews', () => {
          return HttpResponse.json(
            {
              data: {
                status: 'NOT_FOUND',
                code: 404,
                message: '파티룸을 찾을 수 없음',
                errorCode: 'PTR-001',
              },
            },
            { status: 404 }
          );
        })
      );

      try {
        await partyroomsService.enter({ partyroomId: 999 });
        fail('Expected error');
      } catch (e: any) {
        expect(e.isAxiosError).toBe(true);
        expect(e.response.data.errorCode).toBe('PTR-001');
      }
    });

    it('rejects with PTR-002 when room already terminated', async () => {
      server.use(
        http.post('http://localhost:8080/api/v1/partyrooms/:id/crews', () => {
          return HttpResponse.json(
            {
              data: {
                status: 'BAD_REQUEST',
                code: 400,
                message: '이미 종료된 파티룸',
                errorCode: 'PTR-002',
              },
            },
            { status: 400 }
          );
        })
      );

      try {
        await partyroomsService.enter({ partyroomId: 1 });
        fail('Expected error');
      } catch (e: any) {
        expect(e.response.data.errorCode).toBe('PTR-002');
      }
    });
  });

  describe('adjustGrade', () => {
    it('resolves without throwing on success', async () => {
      await partyroomsService.adjustGrade({
        partyroomId: 1,
        crewId: 10,
        gradeType: 'MODERATOR' as any,
      });
    });
  });

  describe('getPartyroomDetailSummary', () => {
    it('returns unwrapped detail summary', async () => {
      const result = await partyroomsService.getPartyroomDetailSummary({ partyroomId: 1 });

      expect(result).toMatchObject({
        title: 'Main Stage',
        linkDomain: 'main-stage',
        playbackTimeLimit: 300,
      });
    });
  });
});
