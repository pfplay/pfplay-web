import { PlaybackHistory } from '@/features/partyroom/list-playback-history';

export default function PlaybackHistoryPanel() {
  return (
    <div className='mt-5 h-[500px] max-h-screen overflow-y-auto'>
      <PlaybackHistory />
    </div>
  );
}
