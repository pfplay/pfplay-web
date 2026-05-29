'use client';
import { FC, RefObject } from 'react';
import type TReactPlayer from 'react-player';
import type { AutoplayGestureGate } from '../../lib/use-autoplay-gesture-gate.hook';

export const COLLAPSED_VIDEO_WIDTH = 80;
export const COLLAPSED_VIDEO_HEIGHT = 45;

export function wrapperClass(mode: 'A' | 'B' | 'C'): string {
  switch (mode) {
    case 'A':
      return 'aspect-video w-full bg-black rounded';
    case 'B':
      return 'w-[80px] h-[45px] shrink-0 bg-black rounded';
    case 'C':
      return 'aspect-video w-full bg-black rounded';
  }
}

interface Props {
  videoId: string | null;
  expanded: boolean;
  onToggleExpand: () => void;
  playerRef: RefObject<TReactPlayer | null>;
  gate: AutoplayGestureGate;
}

const VideoFrame: FC<Props> = (_props) => {
  throw new Error('not implemented');
};

export default VideoFrame;
