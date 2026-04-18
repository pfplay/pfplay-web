import { RequestCookies, ResponseCookies } from 'next/dist/compiled/@edge-runtime/cookies';
import { NextRequest, NextResponse } from 'next/server';

import { TEN_YEARS } from '@/shared/config/time';
import { isMobileUA } from '@/shared/lib/functions/is-mobile-ua';
import { LANGUAGE_COOKIE_KEY, Language } from './shared/lib/localization/constants';

export const middleware = (req: NextRequest) => {
  const { pathname } = req.nextUrl;

  // 모바일 UA 감지 → /mobile-notice로 리다이렉트 (단, /mobile-notice 자체는 제외)
  if (pathname !== '/mobile-notice') {
    const ua = req.headers.get('user-agent') || '';
    if (isMobileUA(ua)) {
      return NextResponse.redirect(new URL('/mobile-notice', req.url));
    }
  }

  // 기존 언어 쿠키 로직 (모든 요청에 적용, /mobile-notice 포함)
  const response = NextResponse.next();

  if (!req.cookies.get(LANGUAGE_COOKIE_KEY)?.value) {
    response.cookies.set(LANGUAGE_COOKIE_KEY, Language.En, {
      path: '/',
      maxAge: TEN_YEARS,
      secure: true,
    });

    setCookieToRequestHeader(req, response);

    return response;
  }
};

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images/
     * - icons/
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images|icons).*)',
  ],
};

/**
 *
 * @see https://github.com/vercel/next.js/issues/49442#issuecomment-1679807704
 *
 * Copy cookies from the Set-Cookie header of the response to the Cookie header of the request,
 * so that it will appear to SSR/RSC as if the user already has the new cookies.
 */
const setCookieToRequestHeader = (req: NextRequest, res: NextResponse) => {
  // parse the outgoing Set-Cookie header
  const setCookies = new ResponseCookies(res.headers);
  // Build a new Cookie header for the request by adding the setCookies
  const newReqHeaders = new Headers(req.headers);
  const newReqCookies = new RequestCookies(newReqHeaders);
  setCookies.getAll().forEach((cookie) => newReqCookies.set(cookie));
  // set “request header overrides” on the outgoing response
  NextResponse.next({
    request: { headers: newReqHeaders },
  }).headers.forEach((value, key) => {
    if (key === 'x-middleware-override-headers' || key.startsWith('x-middleware-request-')) {
      res.headers.set(key, value);
    }
  });
};
