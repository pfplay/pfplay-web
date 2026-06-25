import theme from '@/shared/ui/foundation/theme';

type Params = {
  cinemaView: boolean;
  drawerZIndex: number;
};

/**
 * playlist 관련 overlay/dialog/menu/preview가 참조할 기준 z-index 결정
 */
export function resolvePlaylistLayerZIndex({ cinemaView, drawerZIndex }: Params): number {
  if (!cinemaView) return drawerZIndex;
  return Math.max(drawerZIndex, theme.zIndex.cinema);
}
