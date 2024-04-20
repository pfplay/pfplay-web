'use client';

import { setCookie } from 'cookies-next';
import { Language, LANGUAGE_COOKIE_KEY } from '@/shared/lib/localization/constants';
import { useAppRouter } from '@/shared/lib/router/use-app-router.hook';

export const useChangeLanguage = () => {
  const router = useAppRouter();

  return (lang: Language) => {
    setCookie(LANGUAGE_COOKIE_KEY, lang);
    router.refresh();
  };
};
