'use client';

import { setCookie } from 'cookies-next';
import { useAppRouter } from '@/components/shared/router/use-app-router.hook';
import { CookieKey } from '@/constants/cookie';
import { Language } from '@/constants/lang';

export const useChangeLanguage = () => {
  const router = useAppRouter();

  return (lang: Language) => {
    setCookie(CookieKey.LangCookie, lang);
    router.refresh();
  };
};
