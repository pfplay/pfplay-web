import { ReactNode } from 'react';
import ActionButtons from './parts/action-buttons.component';
import AddTracksButton from './parts/add-tracks-button.component';
import Notice from './parts/notice.component';
import VideoTitle from './parts/video-title.component';
import Video from './parts/video.component';

type Props = {
  width: number;
  headerActions?: ReactNode;
  sidebarActions?: ReactNode;
  sidePanelContent?: ReactNode;
  chatPanelContent?: ReactNode;
};

export default function DisplayBoard({
  width,
  headerActions,
  sidebarActions,
  sidePanelContent,
  chatPanelContent,
}: Props) {
  return (
    <div className='flexCol gap-2' style={{ width }}>
      <div className='flex items-center gap-2'>
        <Notice />
        <AddTracksButton />
      </div>
      <Video
        width={width}
        headerActions={headerActions}
        sidebarActions={sidebarActions}
        sidePanelContent={sidePanelContent}
        chatPanelContent={chatPanelContent}
      />
      <div className='relative p-[20px] bg-black border border-gray-800 rounded'>
        <VideoTitle />

        <div className='absolute right-[6px] top-1/2 transform -translate-y-1/2 z-1 bg-[inherit] border-l-[6px] border-black flexRowCenter gap-1'>
          <ActionButtons />
        </div>
      </div>
    </div>
  );
}
