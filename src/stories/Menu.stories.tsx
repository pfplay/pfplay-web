import type { Meta } from '@storybook/react';
import Icons from '@/components/Icons';
import Menu, { MenuItem } from '@/components/Menu';

const meta = {
  title: 'ui/Menu',
  tags: ['autodocs'],
  component: Menu,
} satisfies Meta<typeof Menu>;

export default meta;

const exampleMenuConfig: Array<MenuItem> = [
  { onClickItem: () => console.log('삭제 clicked'), label: '삭제' },
  { onClickItem: () => console.log('꿀 clicked'), label: '꿀' },
  { onClickItem: () => console.log('킥 clicked'), label: '킥' },
  { onClickItem: () => console.log('밴 clicked'), label: '밴' },
];

export const MenuLarge = () => {
  return (
    <div className='w-2/3 h-72 flexRow justify-end bg-black'>
      <Menu optionMenuConfig={exampleMenuConfig} size='lg' />
    </div>
  );
};

export const MenuMedium = () => {
  return (
    <div className='w-2/3 h-72 flexRow justify-end bg-black'>
      <Menu optionMenuConfig={exampleMenuConfig} size='md' />
    </div>
  );
};

export const MenuSmall = () => {
  return (
    <div className='w-2/3 h-72 flexRow justify-end bg-black'>
      <Menu optionMenuConfig={exampleMenuConfig} size='sm' />
    </div>
  );
};

export const MenuWithHeaderIcon = () => {
  return (
    <div className='w-2/3 h-72 flexRow justify-end bg-black'>
      <Menu
        optionMenuConfig={exampleMenuConfig}
        HeaderIcon={<Icons.arrowLeft width={24} height={24} stroke='#fff' />}
        size='sm'
      />
    </div>
  );
};

export const OptionMenuItemWithPrefixIcon = () => {
  return (
    <div className='w-2/3 h-72 flexRow justify-end bg-black'>
      <Menu
        optionMenuConfig={exampleMenuConfig}
        MenuItemPrefixIcon={<Icons.arrowDown stroke='#fff' />}
      />
    </div>
  );
};
