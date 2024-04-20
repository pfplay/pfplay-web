import { useDebounce } from '@/shared/lib/hooks/use-debounce.hook';
import Input from '@/shared/ui/components/input/input.component';
import { PFSearch } from '@/shared/ui/icons';

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
