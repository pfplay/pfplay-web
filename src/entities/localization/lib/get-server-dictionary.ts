import { cookies } from 'next/headers';
import { Language, COOKIE_KEY } from '../config/constants';

const dictionary = {
  en: () => import('../config/dictionaries/en.json').then((module) => module.default),
  ko: () => import('../config/dictionaries/ko.json').then((module) => module.default),
};

export const getServerDictionary: () => ReturnType<(typeof dictionary)['en']> = async () => {
  const lang = cookies().get(COOKIE_KEY)?.value as Language;

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
