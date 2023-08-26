import type { Meta } from '@storybook/react';
import Select, { SelectListItem } from '@/components/Select';
import Chip from '@/components/ui/Chip';

const meta = {
  title: 'ui/Select',
  tags: ['autodocs'],
  component: Select,
} satisfies Meta<typeof Select>;

export default meta;

const selectListConfig: Array<SelectListItem> = [
  { label: 'Wade Cooper long long long text', value: 'Wade Cooper2' },
  { label: 'Arlene Mccoy', value: 'Arlene Mccoy2' },
  { label: 'Devon Webb long long long text', value: 'Devon Webb2' },
  { label: 'Tom Cook', value: 'Tom Cook2' },
  { label: 'Tanya Fox', value: 'Tanya Fox2' },
  { label: 'Hellen Schmidt', value: 'Hellen Schmidt2' },
];

export const SelectDefault = () => {
  return (
    <div className='w-full h-72 flexRow justify-center bg-black'>
      <Select selectListConfig={selectListConfig} />
    </div>
  );
};

export const SelectWithPrefixIcon = () => {
  return (
    <div className='w-full h-72 flexRow justify-center bg-black'>
      <Select
        selectListConfig={selectListConfig}
        PrefixIcon={<Chip value='현재' variant='outlined' />}
      />
    </div>
  );
};

export const SelectWithInitialValue = () => {
  return (
    <div className='w-full h-72 flexRow justify-center bg-black'>
      <Select
        selectListConfig={selectListConfig}
        PrefixIcon={<Chip value='현재' variant='outlined' />}
        initialValue={selectListConfig[2]}
      />
    </div>
  );
};

export const SelectWithCustomWidth = () => {
  return (
    <div className='w-full h-72 flexRow justify-center bg-black'>
      <Select
        width='w-48'
        selectListConfig={selectListConfig}
        PrefixIcon={<Chip value='현재' variant='outlined' />}
        initialValue={selectListConfig[2]}
      />
    </div>
  );
};
