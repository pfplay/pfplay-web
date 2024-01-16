import Image from 'next/image';
import React from 'react';
import { YoutubeMusicList } from '@/api/@types/Playlist';
import Typography from '@/components/shared/atoms/Typography';
import { PFAddPlaylist } from '@/components/shared/icons';

type YoutubeSearchCardProps = {
  source: YoutubeMusicList;
};

const YoutubeSearchItem = ({
  source: { title, duration, thumbnailMedium },
}: YoutubeSearchCardProps) => {
  return (
    <div className='flex items-center'>
      <Image src={thumbnailMedium} alt={title} width={60} height={60} />
      <Typography className='flex-1'>{title}</Typography>
      <Typography>{duration}</Typography>

      <button>
        <PFAddPlaylist />
      </button>
    </div>
  );
};

export default YoutubeSearchItem;
