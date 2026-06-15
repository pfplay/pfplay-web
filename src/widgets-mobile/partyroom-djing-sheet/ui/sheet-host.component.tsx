'use client';
import { FC } from 'react';
import FullscreenSheet from './fullscreen-sheet.component';
import { useFullscreenSheet } from '../lib/use-fullscreen-sheet.hook';

/**
 * 스택 최상단 entry 만 FullscreenSheet 로 mount.
 * 아래 entry 들은 mount 안 함 — IFrame remount trade-off:
 * - sheet 스택 깊이 변화 (push/pop) 시 위 sheet 의 wrapper 가 unmount/remount.
 * - chunk 3.1 ToS 패턴 "loadVideoById 로 IFrame remount 0" 은 동일 wrapper persistence 전제 — sheet 변경 시엔 적용 안 됨.
 * - 다만 새 IFrame 도 visible frame (64×36) 이므로 ToS 위반 0 (visible 유지).
 * - stack 깊이 = 보통 1~2. add-tracks 의 mini-player 는 sheet 닫힐 때 stopPreview 로 currentTrack 정리.
 */
const SheetHost: FC = () => {
  const { stack, pop } = useFullscreenSheet();
  const top = stack[stack.length - 1];
  if (!top) return null;

  const hasBack = stack.length > 1;

  return (
    <FullscreenSheet open={true} title={top.title} onClose={pop} onBack={hasBack ? pop : undefined}>
      {top.node}
    </FullscreenSheet>
  );
};

export default SheetHost;
