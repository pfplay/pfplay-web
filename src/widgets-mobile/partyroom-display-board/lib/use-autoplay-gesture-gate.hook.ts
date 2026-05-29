import { useEffect, useState, type RefObject } from 'react';
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

export default function useAutoplayGestureGate({
  playerRef,
  videoId,
}: UseAutoplayGestureGateArgs): AutoplayGestureGate {
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [played, setPlayed] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);

  useEffect(() => {
    if (!playerReady || played) return;
    const timer = setTimeout(() => setAutoplayBlocked(true), AUTOPLAY_DETECT_MS);
    return () => clearTimeout(timer);
  }, [playerReady, played, videoId]);

  const handleGesturePlay = () => {
    const internal = playerRef.current?.getInternalPlayer() as
      | { playVideo?: () => void }
      | undefined;
    internal?.playVideo?.();
    setAutoplayBlocked(false);
  };

  const onReady = (_player: TReactPlayer) => {
    setPlayerReady(true);
  };

  const onStart = () => {
    /* seekToLive 는 VideoFrame 의 외부 콜백에서 처리 (data 의존) */
  };

  const onPlay = () => {
    setPlayed(true);
    setAutoplayBlocked(false);
  };

  const onPause = () => {
    /* 본 hook 은 onPause 의 자동 재개 폴백을 수행 안 함 (chunk 3.1 OUT, §9 risk #7) */
  };

  return {
    autoplayBlocked,
    played,
    playerReady,
    handleGesturePlay,
    onReady,
    onStart,
    onPlay,
    onPause,
  };
}
