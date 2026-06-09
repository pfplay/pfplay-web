'use client';
import { FC } from 'react';
import { PREVIEW_PLAYER_SIZES } from '@/entities/music-preview/config/youtube-player.config';
import { YouTubePreviewPlayer } from '@/entities/music-preview/index.ui';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useStores } from '@/shared/lib/store/stores.context';
import { Button } from '@/shared/ui/components/button';
import { TextButton } from '@/shared/ui/components/text-button';
import { Typography } from '@/shared/ui/components/typography';
import { PFClose, PFPauseCircleFilled, PFPlayCircleFilled } from '@/shared/ui/icons';

interface Props {
  /** 추가 시그널. 대상 트랙은 시트가 결정한다(mini-player 의 currentTrack 은 duration 없는 lossy PreviewTrack). */
  onAdd: () => void;
  addPending: boolean;
}

/**
 * sheet 내부 bottom mini-player (spec §5.5 outcome A).
 * - 112px 컨테이너 (= video 36 + 좌우 padding + 컨트롤 cluster 영역)
 * - 좌측: 곡명/아티스트 (flex-1 min-w-0 ellipsis)
 * - 우측: ⏯ + [+ 추가] + × 컨트롤 cluster + video 64×36 (visible frame, ToS 보존)
 * - track 변경 시 YouTubePreviewPlayer 의 wrapper 가 loadVideoById 로 IFrame remount 0 (chunk 3.1 패턴)
 * - source 무관 (spec §B.4) — 데스크탑 sidebar-player 의 source==='playlist-track' 분기 없음
 * - currentTrack 없으면 미렌더. playState idle/paused 도 ▶ 토글 분기 가능하게 렌더.
 * - ⏯ 토글: 미리듣기 store 에 togglePlay 부재 → mini-player 자체 합성
 *   (playing → stopPreview, else → startPreview(currentTrack)).
 */
const MiniPlayer: FC<Props> = ({ onAdd, addPending }) => {
  const t = useI18n();
  const { useMusicPreview } = useStores();
  const { currentTrack, playState, startPreview, stopPreview } = useMusicPreview();

  if (!currentTrack) return null;

  const SIZE = PREVIEW_PLAYER_SIZES['mobile-bottom'];
  const isPlaying = playState === 'playing';

  const togglePlay = () => {
    if (isPlaying) stopPreview();
    else startPreview(currentTrack);
  };

  // PreviewTrack 은 title 만 보장. Phase 6 search-result 확장에서 name/artist 가 채워질 예정.
  // 현재는 양쪽 호환 (test fixture: name/artist / prod baseline: title) → 안전 픽업.
  const track = currentTrack as typeof currentTrack & { name?: string; artist?: string };
  const displayName = track.name ?? track.title ?? '';
  const displayArtist = track.artist ?? '';

  return (
    <div className='h-[112px] flex items-center gap-3 px-3 border-t border-gray-800 bg-black'>
      <div className='flex-1 min-w-0'>
        <Typography type='body3' className='truncate' data-testid='mini-player-name'>
          {displayName}
        </Typography>
        <Typography
          type='detail2'
          className='truncate text-gray-400'
          data-testid='mini-player-artist'
        >
          {displayArtist}
        </Typography>
      </div>
      <div className='flex flex-col items-end gap-2'>
        <div className='flex items-center gap-2'>
          <TextButton
            data-testid='mini-player-toggle-play'
            onClick={togglePlay}
            Icon={
              isPlaying ? (
                <PFPauseCircleFilled width={20} height={20} />
              ) : (
                <PFPlayCircleFilled width={20} height={20} />
              )
            }
            aria-label={isPlaying ? '미리듣기 일시정지' : '미리듣기 재생'}
          />
          <Button
            size='sm'
            data-testid='mini-player-add'
            onClick={() => onAdd()}
            disabled={addPending}
          >
            {t.partyroom.queue.sheet_add_button}
          </Button>
          <TextButton
            data-testid='mini-player-close'
            onClick={stopPreview}
            Icon={<PFClose width={20} height={20} />}
            aria-label='미리듣기 종료'
          />
        </div>
        <YouTubePreviewPlayer width={SIZE.width} height={SIZE.height} showCloseButton={false} />
      </div>
    </div>
  );
};

export default MiniPlayer;
