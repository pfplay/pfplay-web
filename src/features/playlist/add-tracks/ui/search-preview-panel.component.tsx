'use client';

import { PREVIEW_PLAYER_SIZES } from '@/entities/music-preview/config/youtube-player.config';
import { YouTubePreviewPlayer } from '@/entities/music-preview/index.ui';
import { useStores } from '@/shared/lib/store/stores.context';

const SIZE = PREVIEW_PLAYER_SIZES.modal;

/**
 * 검색 모달 우측 컬럼 미리듣기 패널 (issue #420).
 *
 * 기존 floating `ModalPlayer`(중앙 1000px 모달 옆 고정)는 컴플라이언트 크기(≥200×200)를
 * 모달 옆에 둘 공간이 없어(1280px 화면 좌우 여유 ~140px) off-screen 클리핑이 발생했다.
 * → 모달 *내부* 우측 컬럼으로 임베드. 480×270 으로 ToS 최소 크기 충족, 비차단(리스트와 공존).
 *
 * 검색결과 미리듣기 전용 — 플레이리스트 트랙(source='playlist-track')은 데스크탑 SidebarPlayer 책임.
 * idle 시에는 placeholder 로 자리를 유지해 재생 시작 시 레이아웃 시프트가 없다.
 *
 * `max-w-full` — 좁은 폭에서 모달(max-w-full)이 축소되며 세로 스택될 때 패널이 모달 밖으로
 * 삐져나가지 않도록 캡. laptop 이상(우측 컬럼)에서는 부모가 넓어 480px 그대로 유지.
 */
export default function SearchPreviewPanel() {
  const { useMusicPreview } = useStores();
  const { currentTrack, playState, stopPreview } = useMusicPreview();

  const isPlaying = playState === 'playing';
  const showPlayer = !!currentTrack && isPlaying && currentTrack.source === 'search-result';

  return (
    <div className='max-w-full shrink-0' style={{ width: SIZE.width }}>
      {showPlayer ? (
        <YouTubePreviewPlayer width={SIZE.width} height={SIZE.height} onClose={stopPreview} />
      ) : (
        <div
          data-testid='search-preview-placeholder'
          className='flex items-center justify-center rounded border border-gray-700 bg-gray-900 text-sm text-gray-500'
          style={{ width: SIZE.width, height: SIZE.height }}
        >
          트랙을 선택하면 여기서 미리듣기
        </div>
      )}
    </div>
  );
}
