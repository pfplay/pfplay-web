'use client';
import { useDebounce } from '@/shared/lib/hooks/use-debounce.hook';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { Input } from '@/shared/ui/components/input';
import { PFSearch } from '@/shared/ui/icons';

type SearchInputProps = {
  onSearch?(value: string): void;
};
const SearchInput = ({ onSearch }: SearchInputProps) => {
  const t = useI18n();
  const { value, handleChange } = useDebounce((debouncedValue) => {
    onSearch?.(debouncedValue);
  });

  return (
    <Input
      Prefix={<PFSearch />}
      placeholder={t.playlist.para.search_url}
      classNames={{ container: 'flex-1' }}
      initialValue={value}
      onChange={handleChange}
    />
  );
};

export default SearchInput;
