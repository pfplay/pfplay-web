'use client';

import { createContext, ReactElement, useContext } from 'react';
import type DictionaryType from '@/constants/dictionaries/ko.json';

type DictionaryJSONType = typeof DictionaryType;

const DictionaryContext = createContext<DictionaryJSONType | null>(null);

type DictionaryProviderProps = {
  children: ReactElement;
  dictionary: DictionaryJSONType;
};
export function DictionaryProvider({ children, dictionary }: DictionaryProviderProps) {
  return <DictionaryContext.Provider value={dictionary}>{children}</DictionaryContext.Provider>;
}

export const useDictionary = () => {
  const context = useContext(DictionaryContext);

  if (!context) {
    throw new Error('useDictionary must be used within a DialogProvider');
  }

  return context;
};
