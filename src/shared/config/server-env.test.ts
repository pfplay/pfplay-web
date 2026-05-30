import { describe, expect, it } from 'vitest';
import { parseServerEnv } from './server-env';

describe('parseServerEnv', () => {
  it('빈 객체도 통과 (모두 optional or default)', () => {
    const parsed = parseServerEnv({});
    expect(parsed.NODE_ENV).toBe('development');
  });

  it('EDGE_CONFIG optional 통과', () => {
    expect(() => parseServerEnv({})).not.toThrow();
  });

  it('EDGE_CONFIG: 잘못된 URL → throw', () => {
    expect(() => parseServerEnv({ EDGE_CONFIG: 'not-a-url' })).toThrowError(/url|URL/i);
  });

  it('VERCEL_ENV enum: production 통과', () => {
    const parsed = parseServerEnv({ VERCEL_ENV: 'production' });
    expect(parsed.VERCEL_ENV).toBe('production');
  });

  it('VERCEL_ENV enum: 알 수 없는 값 → throw (server 측은 fail-fast)', () => {
    expect(() => parseServerEnv({ VERCEL_ENV: 'staging' })).toThrowError(/VERCEL_ENV/);
  });

  it('NODE_ENV enum: test 통과', () => {
    const parsed = parseServerEnv({ NODE_ENV: 'test' });
    expect(parsed.NODE_ENV).toBe('test');
  });
});
