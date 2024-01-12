import { useContext } from 'react';
import { DictionaryContext } from '@/context/DictionaryProvider';

export const useDictionary = () => {
  const context = useContext(DictionaryContext);
  return context;
};
