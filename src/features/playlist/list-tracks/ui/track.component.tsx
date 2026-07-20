'use client';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { convertPlaylistTrackToPreview } from '@/entities/music-preview';
import { ThumbnailWithPreview } from '@/entities/music-preview/index.ui';
import { usePlaylistLayerZIndex } from '@/entities/ui-state';
import { PlaylistTrack } from '@/shared/api/http/types/playlists';
import { cn } from '@/shared/lib/functions/cn';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useStores } from '@/shared/lib/store/stores.context';
import { IconMenu } from '@/shared/ui/components/icon-menu';
import { MenuItem } from '@/shared/ui/components/menu';
import { CursorBadge, CursorTitle, PlayingBars } from '@/shared/ui/components/track-cursor';
import { Typography } from '@/shared/ui/components/typography';
import { PFDragAndDrop, PFMoreVert } from '@/shared/ui/icons';

type TrackProps = {
  track: PlaylistTrack;
  menuItems: MenuItem[];
  isOverRoomLimit?: boolean;
  /** 지금 재생 중(CurrentDJ 본인 한정, 방 안). NOW 배지 + 이퀄라이저·마퀴 모션. */
  isNow?: boolean;
  /** 내가 다음에 디제잉하면 시작될 곡. NEXT 배지. */
  isNext?: boolean;
};

const Track = ({
  track,
  menuItems,
  isOverRoomLimit = false,
  isNow = false,
  isNext = false,
}: TrackProps) => {
  const t = useI18n();
  const cinemaView = useStores().useUIState((s) => s.cinemaView);
  const layerZIndex = usePlaylistLayerZIndex();
  const menuZIndex = cinemaView ? layerZIndex + 1 : undefined;
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: track.linkId,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // 미리보기용 트랙 데이터 변환
  const previewTrack = convertPlaylistTrackToPreview(track);

  // 커서가 붙은 행은 배지가 ⋮ 자리를 대체한다 (#462 시안).
  const hasCursor = isNow || isNext;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'relative grid grid-cols-[24px_1fr_auto] items-center gap-2 cursor-default',
        isOverRoomLimit && 'opacity-50'
      )}
      style={style}
      {...attributes}
    >
      <div className='flexRowCenter w-6 h-6 cursor-grab' {...listeners}>
        <PFDragAndDrop />
      </div>

      <div className='relative w-full flexRow justify-start rounded gap-[12px] overflow-hidden select-none'>
        {/* 미리보기 기능이 통합된 썸네일 */}
        <div className='relative shrink-0 pointer-events-auto'>
          <ThumbnailWithPreview
            previewTrack={previewTrack}
            thumbnailSrc={track.thumbnailImage ?? '/images/ETC/PlaylistThumbnail.png'}
            thumbnailAlt={track.name}
            width={80}
            height={44}
            className='w-[80px] h-[44px] bg-gray-600'
            imageClassName={cn('w-full h-full object-contain select-none')}
          />
          {isNow && <PlayingBars className='absolute inset-0 pointer-events-none' />}
        </div>

        <div className='flex-1 min-w-0 select-none flexCol overflow-hidden pointer-events-none'>
          <CursorTitle name={track.name} scrolling={isNow} faded={hasCursor} />
          <Typography type='caption1' className='text-gray-400'>
            {track.duration}
          </Typography>
          {isOverRoomLimit && (
            <Typography type='caption1' overflow='ellipsis' className='text-red-300'>
              {t.dj.para.not_playable_in_room}
            </Typography>
          )}
        </div>
      </div>

      <div className='shrink-0'>
        {hasCursor ? (
          <CursorBadge
            variant={isNow ? 'now' : 'next'}
            label={isNow ? t.playlist.para.now_playing : t.playlist.para.next_up}
          />
        ) : (
          <IconMenu
            MenuButtonIcon={<PFMoreVert />}
            menuItemConfig={menuItems}
            menuZIndex={menuZIndex}
          />
        )}
      </div>
    </div>
  );
};

export default Track;
