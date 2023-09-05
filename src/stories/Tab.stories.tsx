import { PropsWithChildren, useState } from 'react';
import { Tab } from '@headlessui/react';
import type { Meta } from '@storybook/react';
import themeColors from 'tailwindcss/colors';
import CustomTab from '@/components/@shared/@atoms/Tab';
import Icons from '@/components/__legacy__/Icons';

const meta = {
  title: '@atoms/CustomTab',
  tags: ['autodocs'],
  component: CustomTab,
} satisfies Meta<typeof CustomTab>;

export default meta;

export const LineTabs = () => {
  const [categories] = useState<typeof exampleTabsConfig>(exampleTabsConfig);

  return (
    <TabsContainer>
      {Object.keys(categories).map((category) => (
        <CustomTab key={category} tabTitle={category} variant='line' />
      ))}
    </TabsContainer>
  );
};

export const TextTabs = () => {
  const [categories] = useState<typeof exampleTabsConfig>(exampleTabsConfig);

  return (
    <TabsContainer>
      {Object.keys(categories).map((category) => (
        <CustomTab key={category} tabTitle={category} variant='text' />
      ))}
    </TabsContainer>
  );
};

export const BoxTabs = () => {
  const [categories] = useState<typeof exampleTabsConfig>(exampleTabsConfig);

  return (
    <TabsContainer>
      {Object.keys(categories).map((category) => (
        <CustomTab
          key={category}
          tabTitle={category}
          variant='box'
          onSwitchPrefixIconColor={(selected: boolean) => {
            return <Icons.square fill={selected ? themeColors.red[500] : themeColors.gray[600]} />;
          }}
        />
      ))}
    </TabsContainer>
  );
};

const exampleTabsConfig = {
  Recent: [
    {
      id: 1,
      title: 'Does drinking coffee make you smarter?',
      date: '5h ago',
      commentCount: 5,
      shareCount: 2,
    },
  ],
  Popular: [
    {
      id: 1,
      title: 'Is tech making coffee better or worse?',
      date: 'Jan 7',
      commentCount: 29,
      shareCount: 16,
    },
  ],
};

const TabsContainer = ({ children }: PropsWithChildren) => {
  return (
    <div className='flexCol items-center bg-black h-52'>
      <Tab.Group>
        <Tab.List className='flex rounded-xl p-1'>{children} </Tab.List>
      </Tab.Group>
    </div>
  );
};
