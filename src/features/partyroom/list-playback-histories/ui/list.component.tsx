import useFetchPlaybackHistory from '@/features/partyroom/list-playback-histories/api/use-fetch-playback-histories.query';
import ListItem from './list-item.component';

export default function List() {
  const { data: list } = useFetchPlaybackHistory();

  return (
    <div className='flex flex-col gap-3'>
      {list?.map((item, index) => (
        <ListItem key={`playback-history-${item.musicName}-${index}`} item={item} />
      ))}
    </div>
  );
}
