'use client';

import { PREVIEW_PLAYER_SIZES } from '@/entities/music-preview/config/youtube-player.config';
import { YouTubePreviewPlayer } from '@/entities/music-preview/index.ui';
import { useStores } from '@/shared/lib/store/stores.context';

type PlayerContainerProps = {
  /** 플레이어 위치 타입 */
  position: 'sidebar' | 'modal';
  /** 추가 CSS 클래스 */
  className?: string;
  /** 닫기 핸들러 */
  onClose?: () => void;
};

/**
 * 미리보기 플레이어 공통 컨테이너
 */
export default function PlayerContainer({ position, className, onClose }: PlayerContainerProps) {
  const { useMusicPreview } = useStores();
  const { currentTrack, playState } = useMusicPreview();

  const isPlaying = playState === 'playing';
  const size = PREVIEW_PLAYER_SIZES[position];

  // 재생 중인 트랙이 없으면 렌더링하지 않음
  if (!currentTrack || !isPlaying) {
    return null;
  }

  return (
    <YouTubePreviewPlayer
      width={size.width}
      height={size.height}
      className={className}
      onClose={onClose}
    />
  );
}
