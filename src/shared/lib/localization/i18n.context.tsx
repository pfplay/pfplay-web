'use client';

import { createContext, ReactElement, useContext } from 'react';
import type DictionaryEN from './dictionaries/en.json';

type I18nJSONType = typeof DictionaryEN;

const I18nContext = createContext<I18nJSONType | null>(null);

type I18nProviderProps = {
  children: ReactElement;
  dictionary: I18nJSONType;
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
