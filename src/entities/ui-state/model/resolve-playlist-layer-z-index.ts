import theme from '@/shared/ui/foundation/theme';

type Params = {
  cinemaView: boolean;
  drawerZIndex: number;
};

/**
 * playlist dialog/preview 레이어의 기준 z-index 를 계산한다.
 *
 * cinema(Theater/Full) 오버레이는 `theme.zIndex.cinema`(전체 화면) 로 떠 있는데,
 * playlist 패널에서 연 dialog 는 기본적으로 drawer(30) 기준이라 오버레이(100) 뒤로 가려진다(#435/#436).
 * cinema 모드일 때 기준을 최소 cinema 레이어까지 올려 dialog(base+1) 가 오버레이 위로 오게 한다.
 *
 * 단, DJ 선택 플로우처럼 이미 dialog 레이어(1000+) 로 올려둔 경우는 낮추면 안 되므로 `max` 로 보존한다.
 */
export function resolvePlaylistLayerZIndex({ cinemaView, drawerZIndex }: Params): number {
  if (!cinemaView) return drawerZIndex;
  return Math.max(drawerZIndex, theme.zIndex.cinema);
}
