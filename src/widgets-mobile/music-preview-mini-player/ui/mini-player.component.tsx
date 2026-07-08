'use client';
import { FC } from 'react';
import { YouTubePreviewPlayer } from '@/entities/music-preview/index.ui';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useStores } from '@/shared/lib/store/stores.context';
import { Button } from '@/shared/ui/components/button';
import { TextButton } from '@/shared/ui/components/text-button';
import { Typography } from '@/shared/ui/components/typography';
import { PFClose, PFPauseCircleFilled, PFPlayCircleFilled } from '@/shared/ui/icons';

/**
 * 미리듣기 영상 높이(px). YouTube ToS(Required Minimum Functionality, issue #420)는 임베드
 * 플레이어 viewport ≥200×200 을 요구한다. 모바일은 전체너비(100%) × 이 높이로 렌더 →
 * 어느 폰 폭(≥320)에서도 width·height 모두 ≥200 을 만족(과거 64×36 썸네일은 위반).
 * 16:9 기준 너비 358px(iPhone13)에서 ~201 → 202 로 둬 양 축 ≥200 안전 확보.
 */
const PREVIEW_CARD_VIDEO_HEIGHT = 202;

interface Props {
  /** 추가 시그널. 대상 트랙은 시트가 결정한다(mini-player 의 currentTrack 은 duration 없는 lossy PreviewTrack). */
  onAdd: () => void;
  addPending: boolean;
}

/**
 * sheet 내부 bottom 미리듣기 카드 (issue #420 ToS 최소 크기 준수).
 * - 과거 112px 바 + 64×36 영상(ToS 위반)을 **전체너비 16:9 카드**로 교체.
 * - 상단: 영상(w-full × 202px, viewport ≥200×200 컴플라이언트)
 * - 하단: 곡명/아티스트(flex-1 ellipsis) + ⏯ · [+ 추가] · × 컨트롤 cluster
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
    <div className='border-t border-gray-800 bg-black'>
      <div className='w-full'>
        <YouTubePreviewPlayer
          width='100%'
          height={PREVIEW_CARD_VIDEO_HEIGHT}
          showCloseButton={false}
        />
      </div>
      <div className='flex items-center gap-3 px-3 py-2'>
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
      </div>
    </div>
  );
};

export default MiniPlayer;
