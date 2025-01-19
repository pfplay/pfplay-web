import { useCurrentPartyroomCrews } from '@/features/partyroom/list-crews';
import { cn } from '@/shared/lib/functions/cn';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@/shared/ui/components/tab';
import UserGradePanel from './parts/user-grade-panel.component';

export default function PartyroomCrewsPanel() {
  const crews = useCurrentPartyroomCrews();

  return (
    <TabGroup defaultIndex={0}>
      <TabList className={cn('w-1/2 flexRow gap-6 justify-start my-6')}>
        <Tab
          tabTitle={`All ${crews.length.toString().padStart(2, '0')}`} // TODO: i18n
          variant='text'
          className='w-fit p-0'
        />
        <Tab
          tabTitle='Ban List' // TODO: i18n
          variant='text'
          className='w-fit p-0'
        />
      </TabList>
      <TabPanels className='flex-1 flexCol'>
        <TabPanel tabIndex={0} className='flex-1 flexCol'>
          <UserGradePanel />
        </TabPanel>
        <TabPanel tabIndex={1} className='flex-1 flexCol overflow-hidden'>
          {/* <PartyroomUserPanel /> */}
        </TabPanel>
      </TabPanels>
    </TabGroup>
  );
}
