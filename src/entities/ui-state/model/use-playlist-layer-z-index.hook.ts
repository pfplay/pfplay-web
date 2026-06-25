import { useStores } from '@/shared/lib/store/stores.context';
import { resolvePlaylistLayerZIndex } from './resolve-playlist-layer-z-index';

/**
 * playlist 관련 팝업/메뉴/프리뷰가 현재 화면 모드에서 가려지지 않도록 사용할 base z-index를 UI store 상태 기준으로 계산
 */
export function usePlaylistLayerZIndex(): number {
  const { useUIState } = useStores();
  const drawerZIndex = useUIState((s) => s.playlistDrawer.zIndex);
  const cinemaView = useUIState((s) => s.cinemaView);
  return resolvePlaylistLayerZIndex({ cinemaView, drawerZIndex });
}
