import { describe, expect, it } from 'vitest';
import theme from '@/shared/ui/foundation/theme';
import { resolvePlaylistLayerZIndex } from './resolve-playlist-layer-z-index';

describe('resolvePlaylistLayerZIndex', () => {
  it('일반 모드에서는 drawer zIndex 를 그대로 사용한다', () => {
    expect(
      resolvePlaylistLayerZIndex({ cinemaView: false, drawerZIndex: theme.zIndex.drawer })
    ).toBe(theme.zIndex.drawer);
  });

  it('cinema 모드에서 기본 drawer zIndex 는 cinema 오버레이 위로 올린다', () => {
    // drawer(30) 기준 dialog 는 31 → cinema 오버레이(100) 뒤로 가려짐.
    // cinema 모드에서는 최소 cinema 레이어까지 올려 dialog(+1) 가 오버레이 위로 오게 한다.
    const base = resolvePlaylistLayerZIndex({
      cinemaView: true,
      drawerZIndex: theme.zIndex.drawer,
    });
    expect(base).toBe(theme.zIndex.cinema);
    expect(base + 1).toBeGreaterThan(theme.zIndex.cinema);
  });

  it('cinema 모드라도 이미 더 높은 zIndex(예: DJ 선택 플로우) 는 낮추지 않는다', () => {
    const djFlowZIndex = theme.zIndex.dialog + 1;
    expect(resolvePlaylistLayerZIndex({ cinemaView: true, drawerZIndex: djFlowZIndex })).toBe(
      djFlowZIndex
    );
  });
});
