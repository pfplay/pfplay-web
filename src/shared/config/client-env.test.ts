import { describe, expect, it } from 'vitest';
import { parseClientEnv } from './client-env';

const validRaw = {
  NEXT_PUBLIC_API_HOST_NAME: 'https://api.pfplay.xyz/api/',
  NEXT_PUBLIC_API_WS_HOST_NAME: 'wss://api.pfplay.xyz/ws',
  NEXT_PUBLIC_WAGMI_PROJECT_ID: 'test-project-id',
  NEXT_PUBLIC_ALCHEMY_PUBLIC_API_KEY: 'test-alchemy-key',
};

describe('parseClientEnv', () => {
  it('필수 key 모두 있으면 통과', () => {
    expect(() => parseClientEnv(validRaw)).not.toThrow();
  });

  it('NEXT_PUBLIC_API_HOST_NAME 누락 시 throw', () => {
    const { NEXT_PUBLIC_API_HOST_NAME: _omit, ...raw } = validRaw;
    expect(() => parseClientEnv(raw)).toThrowError(/NEXT_PUBLIC_API_HOST_NAME/);
  });

  it('잘못된 URL 형식 → Invalid url 메시지', () => {
    expect(() =>
      parseClientEnv({ ...validRaw, NEXT_PUBLIC_API_HOST_NAME: 'api.pfplay.xyz' })
    ).toThrowError(/url|URL/i);
  });

  it('WS 스킴 검증: ws:// 통과', () => {
    expect(() =>
      parseClientEnv({ ...validRaw, NEXT_PUBLIC_API_WS_HOST_NAME: 'ws://localhost:8080/ws' })
    ).not.toThrow();
  });

  it('WS 스킴 검증: http:// throw', () => {
    expect(() =>
      parseClientEnv({ ...validRaw, NEXT_PUBLIC_API_WS_HOST_NAME: 'http://localhost:8080/ws' })
    ).toThrowError(/ws/);
  });

  it('HTTP_TIMEOUT_MS coerce: "3000" → 3000', () => {
    const parsed = parseClientEnv({ ...validRaw, NEXT_PUBLIC_HTTP_TIMEOUT_MS: '3000' });
    expect(parsed.NEXT_PUBLIC_HTTP_TIMEOUT_MS).toBe(3000);
  });

  it('HTTP_TIMEOUT_MS default: undefined → 4000', () => {
    const parsed = parseClientEnv(validRaw);
    expect(parsed.NEXT_PUBLIC_HTTP_TIMEOUT_MS).toBe(4000);
  });

  it('VERCEL_ENV default: undefined → ""', () => {
    const parsed = parseClientEnv(validRaw);
    expect(parsed.NEXT_PUBLIC_VERCEL_ENV).toBe('');
  });

  it('VERCEL_ENV graceful: 알 수 없는 값 → "" (catch)', () => {
    const parsed = parseClientEnv({ ...validRaw, NEXT_PUBLIC_VERCEL_ENV: 'staging' });
    expect(parsed.NEXT_PUBLIC_VERCEL_ENV).toBe('');
  });

  it('AMPLITUDE_API_KEY optional: undefined 통과', () => {
    const parsed = parseClientEnv(validRaw);
    expect(parsed.NEXT_PUBLIC_AMPLITUDE_API_KEY).toBeUndefined();
  });
});
