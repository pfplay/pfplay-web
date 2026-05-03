import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { getSystemStatus } from './get-system-status';
import { SystemStatusResult } from './types';

const SAMPLE: SystemStatusResult = {
  maintenance: null,
  activeAnnouncements: [],
  plannedMaintenance: [],
};

let fetchSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  fetchSpy = vi.spyOn(globalThis, 'fetch');
});

afterEach(() => {
  fetchSpy.mockRestore();
});

describe('getSystemStatus', () => {
  test('200 응답 시 result 필드를 반환', async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify({ result: SAMPLE }), { status: 200 })
    );
    await expect(getSystemStatus()).resolves.toEqual(SAMPLE);
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
