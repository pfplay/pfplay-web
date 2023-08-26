import type { Meta } from '@storybook/react';
import CollapseList, { ListPanel } from '@/components/CollapseList';
import Chip from '@/components/ui/Chip';

const meta = {
  title: 'ui/CollapseList',
  tags: ['autodocs'],
  component: CollapseList,
} satisfies Meta<typeof CollapseList>;

export default meta;

const exampleListPanelConfig: Array<ListPanel> = [
  {
    id: '1',
    title:
      'BLACKPINK(블랙핑크) - Shut Down @인기가요sssss inkigayo 20220925 long long long long long long long longlong long long long text',
    thumbnail: '',
    alt: '',
    duration: '00:00',
  },
  {
    id: '2',
    title: 'BLACKPINK(블랙핑크)checkehck ',
    thumbnail: '',
    alt: '',
    duration: '04:20',
  },
];

export const CollapseListDefault = () => {
  return (
    <div className='w-full h-72 flexRow justify-end bg-black'>
      <CollapseList
        title={'Do you offer technical support?'}
        listPanelConfig={exampleListPanelConfig}
      />
    </div>
  );
};

export const CollapseListAccent = () => {
  return (
    <div className='w-full h-72 flexRow justify-end bg-black'>
      <CollapseList
        variant='accent'
        title={'Do you offer technical support?'}
        listPanelConfig={exampleListPanelConfig}
      />
    </div>
  );
};

export const CollapseListOutlined = () => {
  return (
    <div className='w-full h-72 flexRow justify-end bg-black'>
      <CollapseList
        variant='outlined'
        title={'Do you offer technical support?'}
        listPanelConfig={exampleListPanelConfig}
      />
    </div>
  );
};

export const CollapseListWithPrefixIcon = () => {
  return (
    <div className='w-full h-72 flexRow justify-end bg-black'>
      <CollapseList
        PrefixIcon={<Chip value='Tag' />}
        title={'Do you offer technical support'}
        listPanelConfig={exampleListPanelConfig}
      />
    </div>
  );
};

export const CollapseListWithInfoText = () => {
  return (
    <div className='w-full h-72 flexRow justify-end bg-black'>
      <CollapseList
        title={'Do you offer technical support?'}
        infoText='24곡'
        listPanelConfig={exampleListPanelConfig}
      />
    </div>
  );
};
