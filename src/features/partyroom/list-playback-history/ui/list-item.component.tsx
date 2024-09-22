import Image from 'next/image';
import type { PlaybackHistoryItem } from '@/shared/api/http/types/partyrooms';
import { Tag } from '@/shared/ui/components/tag';
import { Typography } from '@/shared/ui/components/typography';

type Props = {
  item: PlaybackHistoryItem;
};

export default function ListItem({ item }: Props) {
  return (
    <div className='flex flex-col gap-2 p-3 bg-gray-900'>
      <Typography type='caption1'>{item.musicName}</Typography>
      <Tag
        variant='profile'
        PrefixIcon={<Image src={item.avatarIconUri} alt='' width={20} height={20} />}
        value={item.nickname}
        className='shrink-0'
      />
    </div>
  );
}
