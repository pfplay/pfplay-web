import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { getSystemStatus } from './get-system-status';

const okResponse = (body: unknown) => new Response(JSON.stringify(body), { status: 200 });

let fetchSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  fetchSpy = vi.spyOn(globalThis, 'fetch');
});

afterEach(() => {
  fetchSpy.mockRestore();
});

describe('getSystemStatus', () => {
  test('data envelope 를 벗기고 공지의 id 를 announcementId 로 바꾼다', async () => {
    // TODO: 백엔드에서 ws/rest api response id 명칭 통일 후 변경 필요함
    const maintenance = { phase: 'ACTIVE', startAt: '2026-09-12T22:00:00', endAt: null };
    fetchSpy.mockResolvedValueOnce(
      okResponse({
        data: {
          maintenance,
          activeAnnouncements: [{ id: 10, titleKo: '운영 정책 안내' }],
          plannedMaintenance: [],
        },
      })
    );

    await expect(getSystemStatus()).resolves.toEqual({
      maintenance,
      activeAnnouncements: [{ announcementId: 10, titleKo: '운영 정책 안내' }],
      plannedMaintenance: [],
    });
  });

  test('5xx 응답 시 throw', async () => {
    fetchSpy.mockResolvedValueOnce(new Response('boom', { status: 503 }));
    await expect(getSystemStatus()).rejects.toThrow('system-status: HTTP 503');
  });

  test('4xx 응답 시 throw', async () => {
    fetchSpy.mockResolvedValueOnce(new Response('nope', { status: 404 }));
    await expect(getSystemStatus()).rejects.toThrow('system-status: HTTP 404');
  });

  test('JSON 파싱 실패 시 throw', async () => {
    fetchSpy.mockResolvedValueOnce(new Response('not json', { status: 200 }));
    await expect(getSystemStatus()).rejects.toThrow();
  });
});
