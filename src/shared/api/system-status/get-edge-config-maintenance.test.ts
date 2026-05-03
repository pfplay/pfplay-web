import { get } from '@vercel/edge-config';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { getEdgeConfigMaintenance } from './get-edge-config-maintenance';

vi.mock('@vercel/edge-config', () => ({
  get: vi.fn(),
}));

const ACTIVE = {
  phase: 'ACTIVE' as const,
  startAt: '2026-05-04T03:00:00',
  endAt: '2026-05-04T04:00:00',
  messageKo: '점검 중',
  messageEn: 'Maintenance',
};

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('getEdgeConfigMaintenance', () => {
  test('EDGE_CONFIG 환경변수가 없으면 get을 호출하지 않고 null 반환', async () => {
    vi.stubEnv('EDGE_CONFIG', '');
    await expect(getEdgeConfigMaintenance()).resolves.toBeNull();
    expect(get).not.toHaveBeenCalled();
  });

  test('get이 null을 반환하면 null 반환', async () => {
    vi.stubEnv('EDGE_CONFIG', 'https://edge-config.vercel.com/dummy');
    (get as Mock).mockResolvedValueOnce(null);
    await expect(getEdgeConfigMaintenance()).resolves.toBeNull();
    expect(get).toHaveBeenCalledWith('maintenance');
  });

  test('get이 ACTIVE 객체를 반환하면 그대로 반환', async () => {
    vi.stubEnv('EDGE_CONFIG', 'https://edge-config.vercel.com/dummy');
    (get as Mock).mockResolvedValueOnce(ACTIVE);
    await expect(getEdgeConfigMaintenance()).resolves.toEqual(ACTIVE);
  });

  test('get이 throw하면 silent하게 null 반환', async () => {
    vi.stubEnv('EDGE_CONFIG', 'https://edge-config.vercel.com/dummy');
    (get as Mock).mockRejectedValueOnce(new Error('network'));
    await expect(getEdgeConfigMaintenance()).resolves.toBeNull();
  });
});
