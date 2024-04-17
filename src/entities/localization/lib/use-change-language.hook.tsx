'use client';

import { setCookie } from 'cookies-next';
import { useAppRouter } from '@/entities/router';
import { Language, COOKIE_KEY } from '../config/constants';

export const useChangeLanguage = () => {
  const router = useAppRouter();

  return (lang: Language) => {
    setCookie(COOKIE_KEY, lang);
    router.refresh();
  };
};
