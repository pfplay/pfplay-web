import { useDisclosure } from '@/shared/lib/hooks/use-disclosure.hook';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { Button } from '@/shared/ui/components/button';
import { PFInfoOutline } from '@/shared/ui/icons';
import { Panel } from '@/widgets/partyroom-detail/lib/panel-controller.context';
import { PanelController } from '@/widgets/partyroom-detail/lib/panel-controller.provider';
import MainPanel from '@/widgets/partyroom-detail/ui/main-panel.component';
import PanelHeader from '@/widgets/partyroom-detail/ui/panel-header.component';

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
          <div className='absolute top-3 right-[108%] w-[280px] flexCol gap-6 bg-black py-7 px-5'>
            <PanelHeader onClose={onClose} />

            <PanelController.Panel panel={Panel.Main}>
              <MainPanel />
            </PanelController.Panel>

            <PanelController.Panel panel={Panel.PlaybackHistory}>
              <div>{`TODO: PlaybackHistory`}</div>
            </PanelController.Panel>
          </div>
        </PanelController>
      )}
    </div>
  );
}
