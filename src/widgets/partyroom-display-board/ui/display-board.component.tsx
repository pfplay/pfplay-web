import { PFPlaylistAdd, PFThumbDownAlt, PFThumbUpAlt } from '@/shared/ui/icons';
import ActionButton from '@/widgets/partyroom-display-board/ui/parts/action-button.component';
import Notice from './parts/notice.component';
import VideoTitle from './parts/video-title.component';
import Video from './parts/video.component';

type Props = {
  width: number;
};

export default function DisplayBoard({ width }: Props) {
  return (
    <div className='flexCol gap-[8px]' style={{ width }}>
      <Notice />

      <Video width={width} />

      <div className='relative p-[20px] bg-black border border-gray-800 rounded'>
        <VideoTitle />

        <div className='absolute right-[6px] top-1/2 transform -translate-y-1/2 z-1 bg-[inherit] border-l-[6px] border-black flexRowCenter gap-[4px]'>
          <ActionButton
            icon={<PFThumbUpAlt width={18} height={18} />}
            text={17}
            active={true}
            activeColor='red'
          />
          <ActionButton
            icon={<PFPlaylistAdd width={18} height={18} />}
            text={5}
            active={true}
            activeColor='green'
          />
          <ActionButton
            icon={<PFThumbDownAlt width={18} height={18} />}
            text={3}
            active={false}
            activeColor='white'
          />
        </div>
      </div>
    </div>
  );
}
