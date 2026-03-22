'use client';
import { Panel } from '@/widgets/partyroom-detail/lib/panel-controller.context';
import { PanelController } from '@/widgets/partyroom-detail/lib/panel-controller.provider';
import MainPanel from '@/widgets/partyroom-detail/ui/main-panel.component';
import PanelHeader from '@/widgets/partyroom-detail/ui/panel-header.component';
import PlaybackHistoryPanel from '@/widgets/partyroom-detail/ui/playback-history-panel.component';

type Props = {
  onClose: () => void;
};

export default function CinemaDetailPanel({ onClose }: Props) {
  return (
    <PanelController>
      <div className='h-full py-7 px-5 flex flex-col'>
        <PanelHeader onClose={onClose} />
        <PanelController.Panel panel={Panel.Main}>
          <MainPanel />
        </PanelController.Panel>
        <PanelController.Panel panel={Panel.PlaybackHistory}>
          <PlaybackHistoryPanel />
        </PanelController.Panel>
      </div>
    </PanelController>
  );
}
