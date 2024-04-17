import { PropsWithChildren, useState } from 'react';
import type { Meta } from '@storybook/react';
import { Tab, TabGroup, TabList } from '@/shared/ui/components/tab/tab.component';

const meta = {
  title: 'base/Tab',
  tags: ['autodocs'],
  component: Tab,
} satisfies Meta<typeof Tab>;

export default meta;

export const LineTabs = () => {
  const [categories] = useState<typeof exampleTabsConfig>(exampleTabsConfig);

  return (
    <TabsContainer>
      {Object.keys(categories).map((category) => (
        <Tab key={category} tabTitle={category} variant='line' />
      ))}
    </TabsContainer>
  );
};

export const TextTabs = () => {
  const [categories] = useState<typeof exampleTabsConfig>(exampleTabsConfig);

  return (
    <TabsContainer>
      {Object.keys(categories).map((category) => (
        <Tab key={category} tabTitle={category} variant='text' />
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
      <TabGroup>
        <TabList className='flex rounded-xl p-1'>{children} </TabList>
      </TabGroup>
    </div>
  );
};
