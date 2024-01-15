'use client';

import React, { useContext } from 'react';
import type DictionaryType from '../constants/dictionaries/ko.json';

export type DictionaryJSONType = typeof DictionaryType;
export const DictionaryContext = React.createContext({} as DictionaryJSONType);

type DictionaryProviderProps = {
  children: React.ReactNode;
  dictionary: DictionaryJSONType;
};
export function DictionaryProvider({ children, dictionary }: DictionaryProviderProps) {
  return <DictionaryContext.Provider value={dictionary}>{children}</DictionaryContext.Provider>;
}

export const useDictionary = () => {
  const context = useContext(DictionaryContext);
  return context;
};
