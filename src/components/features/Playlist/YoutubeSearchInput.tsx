import React from 'react';
import Input from '@/components/shared/atoms/Input';
import { useDebounce } from '@/hooks/useDebounce';

type YoutubeSearchInputProps = {
  onSearch?(value: string): void;
};
const YoutubeSearchInput = ({ onSearch }: YoutubeSearchInputProps) => {
  const { value, handleChange } = useDebounce((debouncedValue) => {
    onSearch?.(debouncedValue);
  });

  return <Input initialValue={value} onChange={handleChange} />;
};

export default YoutubeSearchInput;
