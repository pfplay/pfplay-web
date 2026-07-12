'use client';

import { useCallback } from 'react';
import { setCookie } from 'cookies-next';
import { TEN_YEARS } from '@/shared/config/time';
import { Language, LANGUAGE_COOKIE_KEY } from '@/shared/lib/localization/constants';
import { useAppRouter } from '@/shared/lib/router/use-app-router.hook';

export const useChangeLanguage = () => {
  const router = useAppRouter();

  return useCallback(
    (lang: Language) => {
      // 사용자의 명시적 선택은 브라우저를 껐다 켜도 유지되어야 한다(#447).
      // 옵션 없는 setCookie 는 세션 쿠키가 되어 종료 시 삭제되고, 재방문 시
      // 미들웨어가 Accept-Language 기반값으로 되돌려 선택이 유실된다.
      setCookie(LANGUAGE_COOKIE_KEY, lang, { maxAge: TEN_YEARS, path: '/' });
      router.refresh();
    },
    [router]
  );
};
