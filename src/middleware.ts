import { NextRequest, NextResponse } from 'next/server';

import { getEdgeConfigMaintenance } from '@/shared/api/system-status';
import { isMobileUA } from '@/shared/lib/functions/is-mobile-ua';
import { LANGUAGE_COOKIE_KEY, Language } from './shared/lib/localization/constants';

const DEVICE_HEADER = 'x-pf-device';

export const middleware = async (req: NextRequest) => {
  // 1) 점검 ACTIVE — rewrite. 변경 없음.
  const maintenance = await getEdgeConfigMaintenance();
  if (maintenance?.phase === 'ACTIVE') {
    const url = req.nextUrl.clone();
    url.pathname = '/maintenance';
    url.searchParams.set('messageKo', maintenance.messageKo);
    url.searchParams.set('messageEn', maintenance.messageEn);
    url.searchParams.set('endAt', maintenance.endAt);
    return NextResponse.rewrite(url);
  }

  // 2) UA → x-pf-device 요청 헤더 주입. page.tsx 의 conditional 렌더 입력값.
  const ua = req.headers.get('user-agent') ?? '';
  const isMobile = isMobileUA(ua);
  const reqHeaders = new Headers(req.headers);
  reqHeaders.set(DEVICE_HEADER, isMobile ? 'mobile' : 'desktop');

  // 3) 언어 쿠키 default. Accept-Language 기반 추정값은 사용자의 명시적 선택이
  //    아니므로 브라우저에 영구 저장하지 않는다(#447) — 매 요청마다 다시 평가되어야
  //    Accept-Language 가 나중에 바뀌어도(예: Edge 언어 목록 정정) 반영된다.
  //    명시적 선택은 useChangeLanguage 훅이 별도로 브라우저에 저장한다.
  const needsLanguageCookie = !req.cookies.get(LANGUAGE_COOKIE_KEY)?.value;
  if (needsLanguageCookie) {
    const language = getPreferredLanguage(req.headers.get('accept-language'));
    // SSR 일관성: 현재 요청부터 새 값을 본다 — req Cookie 헤더에만 합성, 응답에는 set-cookie 하지 않음
    const existingCookie = reqHeaders.get('cookie') ?? '';
    reqHeaders.set(
      'cookie',
      existingCookie
        ? `${existingCookie}; ${LANGUAGE_COOKIE_KEY}=${language}`
        : `${LANGUAGE_COOKIE_KEY}=${language}`
    );
  }

  return NextResponse.next({ request: { headers: reqHeaders } });
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
    '/((?!maintenance|api|_next/static|_next/image|favicon.ico|images|icons).*)',
  ],
};

const getPreferredLanguage = (acceptLanguage: string | null): Language => {
  const preferredLanguage = acceptLanguage
    ?.split(',')
    .map((part) => {
      const [language = '', ...params] = part.trim().split(';');
      const quality = params.find((param) => param.trim().startsWith('q='));

      return {
        language: language.toLowerCase(),
        quality: quality ? Number(quality.trim().slice(2)) : 1,
      };
    })
    .filter(({ language, quality }) => language && quality > 0)
    .sort((a, b) => b.quality - a.quality)
    .find(
      ({ language }) =>
        language === Language.Ko ||
        language.startsWith(`${Language.Ko}-`) ||
        language === Language.En ||
        language.startsWith(`${Language.En}-`)
    )?.language;

  return preferredLanguage === Language.Ko || preferredLanguage?.startsWith(`${Language.Ko}-`)
    ? Language.Ko
    : Language.En;
};
