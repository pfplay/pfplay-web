import { useCurrentPartyroomCrews } from '@/features/partyroom/list-crews';
import { cn } from '@/shared/lib/functions/cn';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@/shared/ui/components/tab';
import AllCrewsPanel from './parts/all-crews-panel.component';
import RestrictionPanel from './parts/restriction-panel.component';

export default function PartyroomCrewsPanel() {
  const t = useI18n();
  const crews = useCurrentPartyroomCrews();

  return (
    <TabGroup defaultIndex={0} className='flex-1 flexCol'>
      <TabList className={cn('w-1/2 flexRow gap-6 justify-start my-6')}>
        <Tab
          tabTitle={t.crews.title.all_count.replace(
            '{count}',
            crews.length.toString().padStart(2, '0')
          )}
          variant='text'
          dataTestId='allCrewsPanel-tab'
          className='w-fit p-0'
        />
        <Tab
          tabTitle={t.crews.title.restriction}
          variant='text'
          dataTestId='restrictionPanel-tab'
          className='w-fit p-0'
        />
      </TabList>
      <TabPanels className='flex-1 flexCol'>
        <TabPanel tabIndex={0} className='flex-1 flexCol' data-testid='allCrewsPanel-trigger'>
          <AllCrewsPanel />
        </TabPanel>
        <TabPanel
          tabIndex={1}
          className='flex-1 flexCol overflow-hidden'
          data-testid='restrictionPanel-trigger'
        >
          <RestrictionPanel />
        </TabPanel>
      </TabPanels>
    </TabGroup>
  );
}
