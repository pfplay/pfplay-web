import { cookies } from 'next/headers';
import { Language, LANGUAGE_COOKIE_KEY } from './constants';

const dictionary = {
  en: () => import('./dictionaries/en.json').then((module) => module.default),
  ko: () => import('./dictionaries/ko.json').then((module) => module.default),
};

export const getServerDictionary: () => ReturnType<(typeof dictionary)['en']> = async () => {
  const lang = cookies().get(LANGUAGE_COOKIE_KEY)?.value as Language;

  if (!lang) {
    console.error('empty language in cookie');
    return dictionary.en();
  }

  if (lang !== Language.Ko && lang !== Language.En) {
    console.error(`invalid language in cookie, your language:  ${lang}`);
    return dictionary.en();
  }

  return dictionary[lang]();
};
