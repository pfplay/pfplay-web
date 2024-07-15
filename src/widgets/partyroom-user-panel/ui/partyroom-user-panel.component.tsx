'use client';
import { cn } from '@/shared/lib/functions/cn';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@/shared/ui/components/tab';
import { UserListPanel } from './user-list-panel';

const PartyroomUserPanel = () => {
  return (
    <TabGroup defaultIndex={0}>
      <TabList className={cn('w-1/2 flexRow gap-6 justify-start my-6')}>
        <Tab
          tabTitle={`전체 00`} // TODO: 기획 쪽에 i18n 추가 요청
          variant='text'
          className='w-fit p-0'
        />
        <Tab
          tabTitle={'재재 목록'} // TODO: 기획 쪽에 i18n 추가 요청
          variant='text'
          className='w-fit p-0'
        />
      </TabList>
      <TabPanels className='flex-1 flexCol'>
        <TabPanel tabIndex={0} className='flex-1 flexCol'>
          <UserListPanel />
        </TabPanel>
        <TabPanel tabIndex={1} className='flex-1 flexCol overflow-hidden'>
          {/* <PartyroomUserPanel /> */}
        </TabPanel>
      </TabPanels>
    </TabGroup>
  );
};

export default PartyroomUserPanel;
