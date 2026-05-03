import { get } from '@vercel/edge-config';
import { Mock, afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
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

const EDGE_CONFIG_DUMMY = 'https://edge-config.vercel.com/dummy';

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

  test('VERCEL_ENV=production 이면 key "maintenance" 로 조회', async () => {
    vi.stubEnv('EDGE_CONFIG', EDGE_CONFIG_DUMMY);
    vi.stubEnv('VERCEL_ENV', 'production');
    (get as Mock).mockResolvedValueOnce(ACTIVE);
    await expect(getEdgeConfigMaintenance()).resolves.toEqual(ACTIVE);
    expect(get).toHaveBeenCalledWith('maintenance');
  });

  test('VERCEL_ENV=preview 이면 key "maintenance_preview" 로 조회', async () => {
    vi.stubEnv('EDGE_CONFIG', EDGE_CONFIG_DUMMY);
    vi.stubEnv('VERCEL_ENV', 'preview');
    (get as Mock).mockResolvedValueOnce(null);
    await getEdgeConfigMaintenance();
    expect(get).toHaveBeenCalledWith('maintenance_preview');
  });

  test('VERCEL_ENV=development 이면 key "maintenance_development" 로 조회', async () => {
    vi.stubEnv('EDGE_CONFIG', EDGE_CONFIG_DUMMY);
    vi.stubEnv('VERCEL_ENV', 'development');
    (get as Mock).mockResolvedValueOnce(null);
    await getEdgeConfigMaintenance();
    expect(get).toHaveBeenCalledWith('maintenance_development');
  });

  test('VERCEL_ENV 미설정이면 development key 로 fallback', async () => {
    vi.stubEnv('EDGE_CONFIG', EDGE_CONFIG_DUMMY);
    vi.stubEnv('VERCEL_ENV', '');
    (get as Mock).mockResolvedValueOnce(null);
    await getEdgeConfigMaintenance();
    expect(get).toHaveBeenCalledWith('maintenance_development');
  });

  test('get이 null을 반환하면 null 반환', async () => {
    vi.stubEnv('EDGE_CONFIG', EDGE_CONFIG_DUMMY);
    vi.stubEnv('VERCEL_ENV', 'production');
    (get as Mock).mockResolvedValueOnce(null);
    await expect(getEdgeConfigMaintenance()).resolves.toBeNull();
  });

  test('get이 throw하면 silent하게 null 반환', async () => {
    vi.stubEnv('EDGE_CONFIG', EDGE_CONFIG_DUMMY);
    vi.stubEnv('VERCEL_ENV', 'production');
    (get as Mock).mockRejectedValueOnce(new Error('network'));
    await expect(getEdgeConfigMaintenance()).resolves.toBeNull();
  });
});
