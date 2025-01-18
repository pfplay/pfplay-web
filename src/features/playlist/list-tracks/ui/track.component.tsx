'use client';
import Image from 'next/image';
import { MouseEvent } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PlaylistTrack } from '@/shared/api/http/types/playlists';
import { cn } from '@/shared/lib/functions/cn';
import { IconMenu } from '@/shared/ui/components/icon-menu';
import { MenuItem } from '@/shared/ui/components/menu';
import { Typography } from '@/shared/ui/components/typography';
import { PFDragAndDrop, PFMoreVert, PFPlayCircleFilled } from '@/shared/ui/icons';

type TrackProps = {
  track: PlaylistTrack;
  menuItems: MenuItem[];
};

const Track = ({ track, menuItems }: TrackProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: track.linkId,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handlePlayBtnClick = (e: MouseEvent<HTMLDivElement>, _id: number) => {
    e.stopPropagation();
    // id는 향후 비디오 재생 api 연결에 사용될 예정입니다.
  };

  return (
    <div
      ref={setNodeRef}
      className='relative grid grid-cols-[24px_1fr_32px] items-center gap-2'
      style={style}
      {...attributes}
    >
      <div className='flexRowCenter w-6 h-6' {...listeners}>
        <PFDragAndDrop />
      </div>

      <div className='relative w-full flexRow justify-start rounded gap-[12px] overflow-hidden'>
        <div className='relative shrink-0 w-[80px] h-[44px] bg-gray-600'>
          <Image
            priority
            src={track.thumbnailImage ?? '/images/ETC/PlaylistThumbnail.png'}
            alt={track.name}
            width={80}
            height={44}
            className={cn('w-full h-full object-contain select-none')}
          />
          <div
            className={cn([
              'absolute inset-0 bg-transparent cursor-pointer z-50 flex justify-center items-center',
              'opacity-from-zero',
            ])}
            onClick={(e) => {
              e.stopPropagation();
              handlePlayBtnClick(e, track.linkId);
            }}
          >
            <PFPlayCircleFilled />
          </div>
        </div>
        <div className='flex-1 min-w-0 select-none flexCol overflow-hidden'>
          <Typography type='caption1' overflow='ellipsis' className='text-gray-50'>
            {track.name}
          </Typography>
          <Typography type='caption1' className='text-gray-400'>
            {track.duration}
          </Typography>
        </div>
      </div>

      <div className='shrink-0'>
        <IconMenu MenuButtonIcon={<PFMoreVert />} menuItemConfig={menuItems} />
      </div>
    </div>
  );
};

export default Track;
