import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, test, vi } from 'vitest';

// getEdgeConfigMaintenance 를 default(비활성)로 mock.
vi.mock('@/shared/api/system-status', () => ({
  getEdgeConfigMaintenance: vi.fn().mockResolvedValue(null),
}));

import { getEdgeConfigMaintenance } from '@/shared/api/system-status';
import { LANGUAGE_COOKIE_KEY, Language } from '@/shared/lib/localization/constants';
import { middleware } from './middleware';

const buildReq = (url: string, headers: Record<string, string> = {}) => {
  return new NextRequest(new URL(url, 'http://localhost'), { headers });
};

/**
 * NOTE: 본 테스트는 Next.js 가 `NextResponse.next({ request: { headers } })` 시
 * `x-middleware-override-headers` / `x-middleware-request-*` 응답 헤더를 set 한다는
 * **현 Next.js 14.x 구현 세부**에 의존한다. Next 업그레이드 시 본 단언이 실패하면
 * 본 테스트 재작성 필요 (당시 framework 가 노출하는 검증 가능한 표면으로 마이그레이션).
 */

describe('middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getEdgeConfigMaintenance).mockResolvedValue(null);
  });

  describe('x-pf-device 헤더 주입', () => {
    test('데스크탑 UA → 응답이 x-pf-device=desktop 으로 다운스트림에 전달된다', async () => {
      const req = buildReq('http://localhost/parties', {
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      });
      const res = await middleware(req);

      expect(res?.headers.get('x-middleware-override-headers')).toContain('x-pf-device');
      expect(res?.headers.get('x-middleware-request-x-pf-device')).toBe('desktop');
    });

    test('모바일 UA → 응답이 x-pf-device=mobile 로 전달된다', async () => {
      const req = buildReq('http://localhost/parties', {
        'user-agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      });
      const res = await middleware(req);
      expect(res?.headers.get('x-middleware-request-x-pf-device')).toBe('mobile');
    });

    test('User-Agent 미존재 → desktop 으로 fallback', async () => {
      const req = buildReq('http://localhost/parties');
      const res = await middleware(req);
      expect(res?.headers.get('x-middleware-request-x-pf-device')).toBe('desktop');
    });
  });

  describe('mobile redirect 제거 검증', () => {
    test('모바일 UA 가 /mobile-notice 로 redirect 되지 않는다', async () => {
      const req = buildReq('http://localhost/parties', {
        'user-agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Safari/604.1',
      });
      const res = await middleware(req);
      // redirect 였다면 location 헤더가 set 됐을 것.
      expect(res?.headers.get('location')).toBeNull();
    });
  });

  describe('점검 ACTIVE rewrite 보존', () => {
    test('점검 ACTIVE → /maintenance 로 rewrite (기존 동작)', async () => {
      vi.mocked(getEdgeConfigMaintenance).mockResolvedValue({
        phase: 'ACTIVE',
        messageKo: '점검 중',
        messageEn: 'Under maintenance',
        endAt: '2026-05-28T20:00:00Z',
      } as any);

      const req = buildReq('http://localhost/parties');
      const res = await middleware(req);
      const rewriteUrl = res?.headers.get('x-middleware-rewrite');
      expect(rewriteUrl).toContain('/maintenance');
      expect(rewriteUrl).toContain('messageKo=');
    });
  });

  describe('언어 쿠키 default 보존', () => {
    test(`${LANGUAGE_COOKIE_KEY} 쿠키 없음 → response.cookies 에 set + 다운스트림 Cookie 헤더에 합성`, async () => {
      const req = buildReq('http://localhost/parties');
      const res = await middleware(req);

      const setCookieHeader = res?.headers.get('set-cookie') ?? '';
      expect(setCookieHeader).toContain(`${LANGUAGE_COOKIE_KEY}=${Language.En}`);
      expect(setCookieHeader).toContain('Max-Age='); // TEN_YEARS
      expect(setCookieHeader).toContain('Secure');
    });

    test(`${LANGUAGE_COOKIE_KEY} 쿠키 없음 + 브라우저 언어 ko → ${Language.Ko} 로 설정`, async () => {
      const req = buildReq('http://localhost/parties', {
        'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
      });
      const res = await middleware(req);

      const setCookieHeader = res?.headers.get('set-cookie') ?? '';
      expect(setCookieHeader).toContain(`${LANGUAGE_COOKIE_KEY}=${Language.Ko}`);
    });

    test(`${LANGUAGE_COOKIE_KEY} 쿠키 있음 → 변경 안 함`, async () => {
      const req = buildReq('http://localhost/parties', {
        cookie: `${LANGUAGE_COOKIE_KEY}=${Language.Ko}`,
      });
      const res = await middleware(req);
      const setCookieHeader = res?.headers.get('set-cookie') ?? '';
      expect(setCookieHeader).not.toContain(`${LANGUAGE_COOKIE_KEY}=`);
    });
  });
});
