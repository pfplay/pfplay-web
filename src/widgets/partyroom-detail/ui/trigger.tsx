import { useDisclosure } from '@/shared/lib/hooks/use-disclosure.hook';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { Button } from '@/shared/ui/components/button';
import { PFInfoOutline } from '@/shared/ui/icons';
import PlaybackHistoryPanel from '@/widgets/partyroom-detail/ui/playback-history-panel.component';
import MainPanel from './main-panel.component';
import PanelHeader from './panel-header.component';
import { Panel } from '../lib/panel-controller.context';
import { PanelController } from '../lib/panel-controller.provider';

export default function Trigger() {
  const t = useI18n();
  const { open, onOpen, onClose } = useDisclosure();

  return (
    <div className='relative'>
      <Button
        color='secondary'
        variant='outline'
        Icon={<PFInfoOutline width={20} height={20} className='[&_*]:stroke-white' />}
        size='sm'
        className='text-gray-50 w-full'
        onClick={onOpen}
      >
        {t.party.title.party_info}
      </Button>

      {open && (
        <PanelController>
          <div className='absolute top-3 right-[108%] w-[280px] bg-black py-7 px-5'>
            <PanelHeader onClose={onClose} />

            <PanelController.Panel panel={Panel.Main}>
              <MainPanel />
            </PanelController.Panel>

            <PanelController.Panel panel={Panel.PlaybackHistory}>
              <PlaybackHistoryPanel />
            </PanelController.Panel>
          </div>
        </PanelController>
      )}
    </div>
  );
}
