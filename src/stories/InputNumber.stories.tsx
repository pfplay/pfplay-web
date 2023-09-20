import { useState } from 'react';
import { Meta, StoryFn } from '@storybook/react';
import InputNumber, { InputNumberProps } from '@/components/@shared/@atoms/InputNumber';

const meta: Meta<typeof InputNumber> = {
  title: '@atoms/InputNumber',
  component: InputNumber,
  tags: ['autodocs'],
};

export default meta;

const Template: StoryFn<Omit<InputNumberProps, 'value' | 'onChange' | 'placeholder'>> = (args) => {
  const [value, setValue] = useState<number>();

  const onChange = (inputValue: number) => {
    setValue(inputValue);
  };

  return <InputNumber {...args} value={value} onChange={onChange} />;
};

export const Preview = Template.bind({});
Preview.args = {};

export const NotLocale = Template.bind({});
NotLocale.args = {
  locale: false,
};
