import { useState } from 'react';
import { Meta, StoryFn } from '@storybook/react';
import Button from '@/components/@shared/@atoms/Button';
import Input, { InputProps } from '@/components/@shared/@atoms/Input';
import Icons from '@/components/__legacy__/Icons';

const meta: Meta<typeof Input> = {
  title: '@atoms/Input',
  component: Input,
  tags: ['autodocs'],
};

export default meta;

const Template: StoryFn<Omit<InputProps, 'value' | 'onChange' | 'placeholder'>> = (args) => {
  const [value, setValue] = useState<string>('');

  const onChange = (inputValue: string) => {
    setValue(inputValue);
  };

  return <Input {...args} placeholder='Placeholder' value={value} onChange={onChange} />;
};

export const Preview = Template.bind({});
Preview.args = {
  maxLength: 10,
};

export const FixedWidth = Template.bind({});
FixedWidth.args = {
  width: 300,
};

export const PrefixAndSuffix = Template.bind({});
PrefixAndSuffix.args = {
  maxLength: 10,
  Prefix: <Icons.headset color='white' />,
  Suffix: (
    <Button color={'secondary'} variant={'outline'}>
      Button
    </Button>
  ),
};

export const LargeAndOutlined = Template.bind({});
LargeAndOutlined.args = {
  variant: 'outlined',
  size: 'lg',
};
