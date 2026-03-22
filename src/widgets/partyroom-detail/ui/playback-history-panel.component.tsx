import { PlaybackHistories } from '@/features/partyroom/list-playback-histories';

export default function PlaybackHistoryPanel() {
  return (
    <div className='mt-5 h-[500px] max-h-screen overflow-y-auto'>
      <PlaybackHistories />
    </div>
  );
}
