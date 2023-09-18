import { useState } from 'react';
import { Meta, StoryFn } from '@storybook/react';
import TextArea, { TextAreaProps } from '@/components/@shared/@atoms/TextArea';

const meta: Meta<typeof TextArea> = {
  title: '@atoms/TextArea',
  component: TextArea,
  tags: ['autodocs'],
};

export default meta;

const Template: StoryFn<Omit<TextAreaProps, 'value' | 'onChange' | 'placeholder'>> = (args) => {
  const [value, setValue] = useState<string>('');

  const onChange = (inputValue: string) => {
    setValue(inputValue);
  };

  return (
    <TextArea
      {...args}
      placeholder='Placeholder'
      maxLength={10}
      value={value}
      onChange={onChange}
    />
  );
};

export const Preview = Template.bind({});
Preview.args = {};

export const FixedWidth = Template.bind({});
FixedWidth.args = {
  width: 400,
};
