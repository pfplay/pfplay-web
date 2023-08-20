import type { Meta } from '@storybook/react';
import OptionMenu, { OptionMenuItem } from '@/components/OptionMenu';

const meta = {
  title: 'ui/OptionMenu',
  tags: ['autodocs'],
  component: OptionMenu,
} satisfies Meta<typeof OptionMenu>;

export default meta;

const exampleMenuConfig: Array<OptionMenuItem> = [
  { onClickItem: () => console.log('삭제 clicked'), label: '삭제' },
  { onClickItem: () => console.log('꿀 clicked'), label: '꿀' },
  { onClickItem: () => console.log('킥 clicked'), label: '킥' },
  { onClickItem: () => console.log('밴 clicked'), label: '밴' },
];

export const OptionMenuDefault = () => {
  return (
    <div className='h-60 flexRow  justify-end bg-black '>
      <OptionMenu optionMenuConfig={exampleMenuConfig} />
    </div>
  );
};

export const OptionMenuLarge = () => {
  return (
    <div className='h-60 flexRow  justify-end bg-black '>
      <OptionMenu optionMenuConfig={exampleMenuConfig} size='lg' />
    </div>
  );
};

export const OptionMenuMedium = () => {
  return (
    <div className='h-60 flexRow  justify-end bg-black '>
      <OptionMenu optionMenuConfig={exampleMenuConfig} size='md' />
    </div>
  );
};

export const OptionMenuSmall = () => {
  return (
    <div className='h-60 flexRow  justify-end bg-black '>
      <OptionMenu optionMenuConfig={exampleMenuConfig} size='sm' />
    </div>
  );
};
