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
  playable,
  videoId,
}: UseAutoplayGestureGateArgs): AutoplayGestureGate {
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [played, setPlayed] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);

  useEffect(() => {
    if (!playable) {
      setPlayerReady(false);
      setPlayed(false);
      setAutoplayBlocked(false);
    }
  }, [playable]);

  // #426: videoId(곡) 변경 시 played 를 리셋하지 않는다.
  // video-frame 의 player key 가 played 를 포함하므로, 곡마다 played 를 false 로 되돌리면
  // IFrame 이 remount 되고 iOS WebKit 에서 user-activation 이 소실돼 곡 전환마다 재-gate 된다.
  // 곡 전환은 백엔드 PlaybackStartedEvent 만(DEACTIVATE 없음) → playable 연속 true 이므로,
  // played 를 유지하면 key 가 불변 → remount 없음 → 첫 탭 이후 곡 전환이 끊김 없이 이어진다.
  // (데스크톱 video.component 의 안정-인스턴스 정책과 동일. 재생 정지→재시작은 아래 [playable]
  //  cleanup 이 played 를 리셋하므로 정상적으로 다시 gate 된다.)
  // autoplayBlocked 만 새 트랙 기준으로 재감지하도록 초기화한다(아직 미재생인 첫 곡 케이스 대비).
  useEffect(() => {
    setAutoplayBlocked(false);
  }, [videoId]);

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
