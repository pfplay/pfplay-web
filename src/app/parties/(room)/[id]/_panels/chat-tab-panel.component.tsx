'use client';
import { cn } from '@/shared/lib/functions/cn';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useStores } from '@/shared/lib/store/stores.context';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@/shared/ui/components/tab';
import { PFChatFilled, PFPersonOutline } from '@/shared/ui/icons';
import { PartyroomChatPanel } from '@/widgets/partyroom-chat-panel';
import { PartyroomCrewsPanel } from '@/widgets/partyroom-crews-panel';

type Props = {
  className?: string;
};

export default function ChatTabPanel({ className }: Props) {
  const t = useI18n();
  const { useCurrentPartyroom } = useStores();
  const crewsCount = useCurrentPartyroom((state) => state.crews.length);

  return (
    <TabGroup defaultIndex={0} className={cn('flex-1 flexCol', className)}>
      <TabList className={cn('flexRow')}>
        <Tab
          tabTitle={t.db.title.chat}
          variant='line'
          PrefixIcon={<PFChatFilled width={20} height={20} />}
        />
        <Tab
          tabTitle={crewsCount.toString()}
          variant='line'
          PrefixIcon={<PFPersonOutline width={20} height={20} />}
        />
      </TabList>
      <TabPanels className='flex-1 flexCol'>
        <TabPanel tabIndex={0} className='flex-1 flexCol'>
          <PartyroomChatPanel />
        </TabPanel>
        <TabPanel tabIndex={1} className='flex-1 flexCol'>
          <PartyroomCrewsPanel />
        </TabPanel>
      </TabPanels>
    </TabGroup>
  );
}
