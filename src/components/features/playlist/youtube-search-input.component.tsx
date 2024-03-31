import React from 'react';
import Input from '@/components/shared/atoms/input.component';
import { PFSearch } from '@/components/shared/icons';
import { useDebounce } from '@/hooks/use-debounce.hook';

type YoutubeSearchInputProps = {
  onSearch?(value: string): void;
};
const YoutubeSearchInput = ({ onSearch }: YoutubeSearchInputProps) => {
  const { value, handleChange } = useDebounce((debouncedValue) => {
    onSearch?.(debouncedValue);
  });

  return (
    <Input
      Prefix={<PFSearch />}
      placeholder='Search for music and URL'
      classNames={{ container: 'flex-1' }}
      initialValue={value}
      onChange={handleChange}
    />
  );
};

export default YoutubeSearchInput;
