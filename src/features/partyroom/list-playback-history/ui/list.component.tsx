import ListItem from './list-item.component';
import useFetchPlaybackHistory from '../api/use-fetch-playback-history.query';

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
