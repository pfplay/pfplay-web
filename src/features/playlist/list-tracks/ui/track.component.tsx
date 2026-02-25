'use client';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { convertPlaylistTrackToPreview } from '@/entities/music-preview';
import { ThumbnailWithPreview } from '@/entities/music-preview/index.ui';
import { PlaylistTrack } from '@/shared/api/http/types/playlists';
import { cn } from '@/shared/lib/functions/cn';
import { IconMenu } from '@/shared/ui/components/icon-menu';
import { MenuItem } from '@/shared/ui/components/menu';
import { Typography } from '@/shared/ui/components/typography';
import { PFDragAndDrop, PFMoreVert } from '@/shared/ui/icons';

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

  // 미리보기용 트랙 데이터 변환
  const previewTrack = convertPlaylistTrackToPreview(track);

  return (
    <div
      ref={setNodeRef}
      className='relative grid grid-cols-[24px_1fr_32px] items-center gap-2 cursor-default'
      style={style}
      {...attributes}
    >
      <div className='flexRowCenter w-6 h-6 cursor-grab' {...listeners}>
        <PFDragAndDrop />
      </div>

      <div className='relative w-full flexRow justify-start rounded gap-[12px] overflow-hidden select-none'>
        {/* 미리보기 기능이 통합된 썸네일 */}
        <div className='shrink-0 pointer-events-auto'>
          <ThumbnailWithPreview
            previewTrack={previewTrack}
            thumbnailSrc={track.thumbnailImage ?? '/images/ETC/PlaylistThumbnail.png'}
            thumbnailAlt={track.name}
            width={80}
            height={44}
            className='w-[80px] h-[44px] bg-gray-600'
            imageClassName={cn('w-full h-full object-contain select-none')}
          />
        </div>

        <div className='flex-1 min-w-0 select-none flexCol overflow-hidden pointer-events-none'>
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
