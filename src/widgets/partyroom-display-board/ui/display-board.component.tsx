import ActionButtons from './parts/action-buttons.component';
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
          <ActionButtons />
        </div>
      </div>
    </div>
  );
}
