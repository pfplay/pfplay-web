'use client';

import { usePlaylistLayerZIndex } from '@/entities/ui-state';
import { useStores } from '@/shared/lib/store/stores.context';
import DimOverlay from './dim-overlay.component';
import PlayerContainer from './player-container.component';

/**
 * ⓐ 사이드바 좌측 미리보기 플레이어
 * 우측 사이드바 바로 왼쪽에 부착 + 부분 dim 효과
 */
export default function SidebarPlayer() {
  const { useMusicPreview, useUIState } = useStores();
  const { currentTrack, playState, stopPreview } = useMusicPreview();
  const playlistDrawer = useUIState((s) => s.playlistDrawer);
  const cinemaView = useUIState((s) => s.cinemaView);
  const layerZIndex = usePlaylistLayerZIndex();

  const isPlaying = playState === 'playing';
  // 플레이리스트 트랙만 사이드바 플레이어에서 재생
  const shouldShow = currentTrack && isPlaying && currentTrack.source === 'playlist-track';

  if (!shouldShow) {
    return null;
  }

  // 일반 모드: 사이드바(drawer) 바로 아래. cinema 모드: 패널이 cinema 오버레이(z-cinema=100) 안에 있어
  // body 레벨인 이 플레이어는 오버레이 위로 올려야 가려지지 않는다(#435/#436). dim 은 그 바로 아래.
  const dimZIndex = cinemaView ? layerZIndex + 1 : undefined;
  const playerZIndex = cinemaView ? layerZIndex + 2 : playlistDrawer.zIndex - 1;

  return (
    <>
      {/* 부분 Dim 효과 - 사이드바를 제외한 영역만 */}
      <DimOverlay
        onClick={stopPreview}
        className='!right-[400px]' // 사이드바 영역(400px) 제외
        zIndex={dimZIndex}
      />

      {/* 우측 사이드바 바로 왼쪽에 고정 플레이어 - 패딩 고려하여 더 왼쪽 */}
      <div
        className='fixed top-1/2 transform -translate-y-1/2'
        style={{
          right: '460px', // 사이드바(400px) + 패딩 고려(60px)
          zIndex: playerZIndex,
        }}
      >
        <PlayerContainer position='sidebar' className='shadow-2xl' onClose={stopPreview} />
      </div>
    </>
  );
}
