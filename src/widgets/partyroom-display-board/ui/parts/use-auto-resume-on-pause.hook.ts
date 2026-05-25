import { RefObject, useEffect, useRef } from 'react';
import type TReactPlayer from 'react-player';

// YouTube IFrame API 의 PlayerState. 자동 재개 후에도 이 값이면 정책상 차단된 것으로 본다.
// @see https://developers.google.com/youtube/iframe_api_reference#getPlayerState
const YT_PLAYER_STATE_PAUSED = 2;

// playVideo() 자동 시도 후 이 시간 뒤 상태를 재확인한다. buffering→playing 전이를 기다릴 만큼은
// 길고, 차단 시 폴백이 너무 늦지 않을 만큼은 짧게.
export const RESUME_RECHECK_MS = 1200;

type InternalYouTubePlayer = {
  playVideo?: () => void;
  getPlayerState?: () => number;
};

/**
 * 블루투스 이어폰 제거 등 외부 인터럽트로 비디오가 자동 일시정지되면 사용자 인터랙션 없이
 * 재생을 자동 재개한다(이슈 #334, A안). 전광판엔 의도적 일시정지 UI 가 없으므로 모든 pause 를
 * 비자발적 인터럽트로 간주한다.
 *
 * - 데스크톱(Chrome/Edge/FF): 입장 시 sticky activation 이 유지돼 `playVideo()` 가 곧바로 성공.
 * - Safari/iOS: 프로그래매틱 재생이 정책상 거부될 수 있어, 재확인 시점에도 PAUSED 면 `onFallback`
 *   (기존 "탭하여 재생" gesture gate)으로 위임한다.
 * - mute 는 절대 건드리지 않는다. naive mute 는 sticky 라 이어폰 재연결 시 무음이 잔존한다.
 *
 * @param playerRef react-player 인스턴스 ref
 * @param enabled   재생이 활성이어야 하는 상태(`videoId && playerReady`)일 때만 동작
 * @param onFallback 자동 재개 실패 시 호출(주로 gesture gate 노출)
 * @returns react-player 의 `onPause` 에 연결할 핸들러
 */
export function useAutoResumeOnPause(
  playerRef: RefObject<TReactPlayer | null>,
  { enabled, onFallback }: { enabled: boolean; onFallback: () => void }
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    []
  );

  return () => {
    if (!enabled) return;

    const internal = playerRef.current?.getInternalPlayer() as
      | InternalYouTubePlayer
      | null
      | undefined;
    internal?.playVideo?.();

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      if (internal?.getPlayerState?.() === YT_PLAYER_STATE_PAUSED) {
        onFallback();
      }
    }, RESUME_RECHECK_MS);
  };
}
