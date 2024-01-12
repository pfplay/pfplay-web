import { RequestCookies, ResponseCookies } from 'next/dist/compiled/@edge-runtime/cookies';
import { NextRequest, NextResponse } from 'next/server';

import { COOKIE_10_YEARS_OPTIONS, CookieKey } from './constants/cookie';
import { Language } from './constants/lang';

export const middleware = (req: NextRequest) => {
  const response = NextResponse.next();

  if (!req.cookies.get(CookieKey.LangCookie)?.value) {
    response.cookies.set(CookieKey.LangCookie, Language.Ko, COOKIE_10_YEARS_OPTIONS);

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
