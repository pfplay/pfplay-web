'use client';

import { setCookie } from 'cookies-next';
import { useAppRouter } from '@/components/shared/Router/useAppRouter';
import { CookieKey } from '@/constants/cookie';
import { Language } from '@/constants/lang';

export const useChangeLanguage = () => {
  const router = useAppRouter();
  const handler = (lang: Language) => {
    setCookie(CookieKey.LangCookie, lang);
    router.refresh();
  };

  return handler;
};
