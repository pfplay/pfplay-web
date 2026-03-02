/**
 * @jest-environment <rootDir>/src/shared/api/__test__/jest-msw-env.ts
 */
import { http, HttpResponse } from 'msw';
import { server } from '@/shared/api/__test__/msw-server';
import errorEmitter from '@/shared/api/http/error/error-emitter';
import {
  usersService,
  partyroomsService,
  crewsService,
  djsService,
} from '@/shared/api/http/services';

describe('Interceptor chain integration (401 auth errors across services)', () => {
  function create401Handler(url: string, errorCode: string) {
    return http.get(url, () => {
      return HttpResponse.json(
        {
          data: {
            status: 'UNAUTHORIZED',
            code: 401,
            message: 'ACCESS_TOKEN 이 만료됨',
            errorCode,
          },
        },
        { status: 401 }
      );
    });
  }

  it('usersService.getMyInfo 401 → AxiosError with errorCode emitted', async () => {
    server.use(create401Handler('http://localhost:8080/api/v1/users/me/info', 'JWT-003'));

    const emitted: string[] = [];
    const unsub = errorEmitter.on('JWT-003' as any, () => emitted.push('JWT-003'));

    try {
      await usersService.getMyInfo();
      fail('Expected error');
    } catch (e: any) {
      expect(e.isAxiosError).toBe(true);
      expect(e.response.status).toBe(401);
    }

    expect(emitted).toContain('JWT-003');
    unsub();
  });

  it('partyroomsService.getList 401 → AxiosError propagated', async () => {
    server.use(create401Handler('http://localhost:8080/api/v1/partyrooms', 'JWT-001'));

    try {
      await partyroomsService.getList();
      fail('Expected error');
    } catch (e: any) {
      expect(e.isAxiosError).toBe(true);
      expect(e.response.status).toBe(401);
    }
  });

  it('crewsService.getBlockedCrews 401 → AxiosError propagated', async () => {
    server.use(create401Handler('http://localhost:8080/api/v1/crews/me/blocks', 'JWT-002'));

    try {
      await crewsService.getBlockedCrews();
      fail('Expected error');
    } catch (e: any) {
      expect(e.isAxiosError).toBe(true);
      expect(e.response.status).toBe(401);
    }
  });

  it('djsService.getPlaybackHistories 401 → AxiosError propagated', async () => {
    server.use(
      http.get('http://localhost:8080/api/v1/partyrooms/:id/playbacks/histories', () => {
        return HttpResponse.json(
          {
            data: {
              status: 'UNAUTHORIZED',
              code: 401,
              message: 'ACCESS_TOKEN 이 유효하지 않음',
              errorCode: 'JWT-002',
            },
          },
          { status: 401 }
        );
      })
    );

    try {
      await djsService.getPlaybackHistories({ partyroomId: 1 });
      fail('Expected error');
    } catch (e: any) {
      expect(e.isAxiosError).toBe(true);
      expect(e.response.status).toBe(401);
    }
  });

  it('unwrapError extracts nested data from error response', async () => {
    server.use(
      http.post('http://localhost:8080/api/v1/partyrooms/:id/enter', () => {
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
      // unwrapError should have unwrapped { data: { ... } } → { ... }
      expect(e.response.data.errorCode).toBe('PTR-003');
      expect(e.response.data.message).toBe('파티룸 정원 초과');
    }
  });
});
