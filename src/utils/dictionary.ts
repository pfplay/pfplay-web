import { cookies } from 'next/headers';
import { CookieKey } from '@/constants/cookie';
import { Language } from '@/constants/lang';

const dictionary = {
  en: () => import('../constants/dictionaries/en.json').then((module) => module.default),
  ko: () => import('../constants/dictionaries/ko.json').then((module) => module.default),
};

type DictionaryType = typeof dictionary;
export const getServerDictionary: () => ReturnType<DictionaryType['ko']> = async () => {
  const lang = cookies().get(CookieKey.LangCookie)?.value as Language;

  if (!lang) {
    console.error('empty language in cookie');
    return dictionary.ko();
  }

  if (lang !== Language.Ko && lang !== Language.En) {
    console.error(`invalid language in cookie, your language:  ${lang}`);
    return dictionary.ko();
  }

  return dictionary[lang]();
};
