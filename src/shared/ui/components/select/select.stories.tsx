import type { Meta } from '@storybook/react';
import Select, { SelectOption } from './select.component';
import { Typography } from '../typography';

const meta = {
  title: 'base/Select',
  tags: ['autodocs'],
  component: Select,
  decorators: [
    (Story) => <div className='w-full h-72 flexCol item-center gap-4 p-4 bg-black'>{Story()}</div>,
  ],
} satisfies Meta<typeof Select>;

export default meta;

const options: SelectOption[] = [
  { label: 'Wade Cooper long long long text', value: 'Wade Cooper2' },
  { label: 'Arlene Mccoy', value: 'Arlene Mccoy2' },
  { label: 'Devon Webb long long long text', value: 'Devon Webb2' },
  { label: 'Tom Cook', value: 'Tom Cook2' },
  { label: 'Tanya Fox', value: 'Tanya Fox2' },
  { label: 'Hellen Schmidt', value: 'Hellen Schmidt2' },
];

export const SelectDefault = () => {
  return <Select options={options} />;
};

export const SelectWithInitialValue = () => {
  return (
    <>
      <Typography type='title2' className='text-white'>
        Select with initial value
      </Typography>
      <Select options={options} initialValue={options[2]} />
    </>
  );
};
