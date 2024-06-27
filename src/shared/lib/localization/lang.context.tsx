'use client';

import { createContext, ReactElement, useContext } from 'react';
import { Language } from './constants';

const LangContext = createContext<Language | null>(null);

type LangProviderProps = {
  children: ReactElement;
  lang: Language;
};
export function LangProvider({ children, lang }: LangProviderProps) {
  return <LangContext.Provider value={lang}>{children}</LangContext.Provider>;
}

export const useLang = () => {
  const context = useContext(LangContext);

  if (!context) {
    throw new Error('useLang must be used within a DialogProvider');
  }

  return context;
};
