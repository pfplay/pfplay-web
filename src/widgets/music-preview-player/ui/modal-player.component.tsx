'use client';

import { useStores } from '@/shared/lib/store/stores.context';
import PlayerContainer from './player-container.component';

/**
 * ⓑ 모달 외부 미리보기 플레이어
 * 음악 검색 모달 바로 왼쪽에 고정 위치로 표시 (모달과 완전 분리)
 */
export default function ModalPlayer() {
  const { useMusicPreview, useUIState } = useStores();
  const { currentTrack, playState, stopPreview } = useMusicPreview();
  const { playlistDrawer } = useUIState();

  const isPlaying = playState === 'playing';
  // 검색 결과만 모달 플레이어에서 재생
  const shouldShow = currentTrack && isPlaying && currentTrack.source === 'search-result';

  if (!shouldShow) {
    return null;
  }

  return (
    <div
      className='fixed top-1/2 transform -translate-y-1/2'
      style={{
        right: 'calc(50% + 520px)', // 모달(1000px) 바로 왼쪽
        zIndex: playlistDrawer.zIndex + 2, // 모달보다 높게
      }}
    >
      <PlayerContainer position='modal' className='shadow-2xl' onClose={stopPreview} />
    </div>
  );
}
