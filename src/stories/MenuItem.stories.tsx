import type { Meta } from '@storybook/react';
import OptionMenu from '@/components/OptionMenu';
import MenuItem from '@/components/ui/MenuItem';

const meta = {
  title: 'ui/MenuItem',
  tags: ['autodocs'],
  component: MenuItem,
} satisfies Meta<typeof MenuItem>;

export default meta;

const exampleMenuConfig = [
  { link: '/account-settings', label: 'Account settings' },
  { link: '/support', label: 'Support' },
  { link: '/license', label: 'License' },
  { link: '/sign-out', label: 'Sign out' },
];

// TODO: change to menu item data not array
export const Default = () => {
  return (
    <OptionMenu>
      {exampleMenuConfig.map((menuConfig) => (
        <MenuItem key={menuConfig.link} menuItem={menuConfig} />
      ))}
    </OptionMenu>
  );
};

export const MenuSizeSmall = () => {
  return (
    <OptionMenu size='sm'>
      {exampleMenuConfig.map((menuConfig) => (
        <MenuItem key={menuConfig.link} menuItem={menuConfig} size='sm' />
      ))}
    </OptionMenu>
  );
};
