import { useState } from 'react';
import type { Meta, StoryFn } from '@storybook/react';
import { Tag } from '@/shared/ui/components/tag';
import { Typography } from '@/shared/ui/components/typography';
import Select, { SelectOption } from './select.component';

const meta = {
  title: 'base/Select',
  tags: ['autodocs'],
  component: Select,
  decorators: [
    (Story) => <div className='w-full h-80 flexCol item-center gap-4 p-4 bg-black'>{Story()}</div>,
  ],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryFn<typeof Select>;

const options: SelectOption<string>[] = [
  { label: 'AA', value: 'aa' },
  { label: 'BB', value: 'bb' },
  { label: 'CC', value: 'cc' },
  { label: 'long long long long long long long text', value: 'long' },
];

export const Default: Story = () => {
  const [selected, setSelected] = useState<string>();

  return (
    <>
      <Typography>Selected value: {selected}</Typography>

      <Select className='w-[300px]' options={options} onChange={setSelected} />
    </>
  );
};

export const PrefixAndSuffix: Story = () => {
  const [selected, setSelected] = useState<string>();

  const newOptions = options.map((option) => ({
    ...option,
    prefix: <Tag variant='outlined' value='Tag' />,
    suffix: (
      <Typography type='caption1' className='text-gray-300'>
        unit
      </Typography>
    ),
  }));

  return (
    <>
      <Typography>Selected value: {selected}</Typography>

      <Select className='w-[300px]' options={newOptions} onChange={setSelected} />
    </>
  );
};
