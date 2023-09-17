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

export const Icon = Template.bind({});
Icon.args = {
  maxLength: 10,
  Icon: <Icons.headset color='white' />,
};

export const Button_ = Template.bind({});
Button_.args = {
  Button: <Button Icon={<Icons.chat color={'white'} />} />,
};

export const Fully = Template.bind({});
Fully.args = {
  maxLength: 10,
  Icon: <Icons.headset color='white' />,
  Button: (
    <Button color={'secondary'} variant={'outline'}>
      Button
    </Button>
  ),
};
