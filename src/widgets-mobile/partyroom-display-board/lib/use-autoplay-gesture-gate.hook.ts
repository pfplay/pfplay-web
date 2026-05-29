// src/widgets-mobile/partyroom-display-board/lib/use-autoplay-gesture-gate.hook.ts
import type { RefObject } from 'react';
import type TReactPlayer from 'react-player';

export const AUTOPLAY_DETECT_MS = 1500;

interface UseAutoplayGestureGateArgs {
  playerRef: RefObject<TReactPlayer | null>;
  playable: boolean;
  videoId: string | null;
}

export interface AutoplayGestureGate {
  autoplayBlocked: boolean;
  played: boolean;
  playerReady: boolean;
  handleGesturePlay: () => void;
  onReady: (player: TReactPlayer) => void;
  onStart: () => void;
  onPlay: () => void;
  onPause: () => void;
}

export default function useAutoplayGestureGate(
  _args: UseAutoplayGestureGateArgs
): AutoplayGestureGate {
  throw new Error('not implemented');
}
