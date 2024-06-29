'use client';

import { createContext, ReactElement, useContext } from 'react';
import type DictionaryEN from './dictionaries/en.json';

export type Dictonary = typeof DictionaryEN;

const I18nContext = createContext<Dictonary | null>(null);

type I18nProviderProps = {
  children: ReactElement;
  dictionary: Dictonary;
};
export function I18nProvider({ children, dictionary }: I18nProviderProps) {
  return <I18nContext.Provider value={dictionary}>{children}</I18nContext.Provider>;
}

export const useI18n = () => {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error('useI18n must be used within a DialogProvider');
  }

  return context;
};
