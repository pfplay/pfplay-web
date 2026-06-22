import { useStores } from '@/shared/lib/store/stores.context';
import { resolvePlaylistLayerZIndex } from './resolve-playlist-layer-z-index';

/**
 * playlist dialog/preview 가 cinema(Theater/Full) 오버레이에 가려지지 않도록(#435/#436)
 * 기준 z-index 를 반환한다. 일반 모드에서는 drawer zIndex 그대로, cinema 모드에서는
 * 오버레이 위로 올린 값을 돌려준다.
 *
 * 사용처는 기존 `playlistDrawer.zIndex` 자리에 이 값을 넣고 동일한 offset(+1/+2)을 유지하면 된다.
 */
export function usePlaylistLayerZIndex(): number {
  const { useUIState } = useStores();
  const drawerZIndex = useUIState((s) => s.playlistDrawer.zIndex);
  const cinemaView = useUIState((s) => s.cinemaView);
  return resolvePlaylistLayerZIndex({ cinemaView, drawerZIndex });
}
