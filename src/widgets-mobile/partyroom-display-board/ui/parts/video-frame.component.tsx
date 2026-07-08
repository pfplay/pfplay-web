'use client';
import dynamic from 'next/dynamic';
import { FC, MutableRefObject, useEffect } from 'react';
import type TReactPlayer from 'react-player';
import { YouTubeConfig } from 'react-player/youtube';
import * as Playback from '@/entities/current-partyroom/model/playback.model';
import { useUserPreferenceStore } from '@/entities/preference';
import { PartyroomPlayback } from '@/shared/api/http/types/partyrooms';
import { cn } from '@/shared/lib/functions/cn';
import BlankPlaceholder from './blank-placeholder.component';
import type { AutoplayGestureGate } from '../../lib/use-autoplay-gesture-gate.hook';

const YoutubePlayer = dynamic(() => import('react-player/youtube'), { ssr: false });

/**
 * ToS 최소 크기 (issue #420): YouTube 임베드 플레이어는 viewport ≥200×200 이어야 한다
 * (Required Minimum Functionality). 16:9 에서 높이 200px 는 너비 356px 를 요구하므로
 * 모바일에서는 **전체너비 16:9 가 사실상 유일한 컴플라이언트 크기** — 썸네일 축소(과거 80×45
 * "Mode B") 는 어떤 크기로도 위반이라 컨셉째 제거했다. 재생 중 영상은 항상 전체너비로 표시.
 */
export const VIDEO_WRAPPER_CLASS = 'aspect-video w-full bg-black rounded';

interface Props {
  videoId: string | null;
  // VideoFrame 본문이 onReady 에서 playerRef.current 에 react-player 인스턴스를 할당하므로
  // MutableRefObject 가 필요. 부모는 useRef<TReactPlayer | null>(null) 로 그대로 생성.
  playerRef: MutableRefObject<TReactPlayer | null>;
  gate: AutoplayGestureGate;
  /**
   * playback.endTime/duration 기반 라이브 위치 seek 에 사용.
   * 데스크탑 widgets/partyroom-display-board/ui/parts/video.component.tsx 의 seekToLive 와 동일 정책.
   * null/undefined 면 seek 안 함 (비재생이거나 데이터 미도착).
   */
  playback?: PartyroomPlayback | null;
}

const VideoFrame: FC<Props> = ({ videoId, playerRef, gate, playback }) => {
  const isPlaying = videoId !== null;
  const volume = useUserPreferenceStore((s) => s.volume);
  const muted = useUserPreferenceStore((s) => s.muted);

  // 현재 트랙의 라이브 위치로 seek. player onReady · 트랙 변경 onStart 양쪽에서 호출.
  // 데스크탑 PartyroomDisplayBoard 의 seekToLive 와 정확히 동일 패턴.
  const seekToLive = () => {
    if (!playback) return;
    playerRef.current?.seekTo(Playback.getInitialSeek(playback), 'seconds');
  };

  // playback.id 변경 (트랙 변경 OR 같은 곡 회전) 감지 → 명시적 IFrame reload (#384).
  // react-player 는 url prop 이 동일하면 (같은 linkId 회전 케이스) IFrame 에 reload 명령을 안 보낸다.
  // 결과: 곡 ended state 그대로 유지 → DJ 1명+곡 1개 시나리오에서 재생 정지.
  // 데스크탑 widgets/partyroom-display-board/.../video.component 와 정확히 동일 패턴.
  const playbackId = playback?.id;
  useEffect(() => {
    if (!playbackId || !videoId || !playerRef.current) return;
    const internal = playerRef.current.getInternalPlayer() as
      | { loadVideoById?: (id: string, start?: number) => void; playVideo?: () => void }
      | undefined;
    const startSeconds = playback ? Playback.getInitialSeek(playback) : 0;
    if (internal?.loadVideoById) {
      internal.loadVideoById(videoId, startSeconds);
    } else {
      playerRef.current.seekTo(startSeconds, 'seconds');
      internal?.playVideo?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playbackId]);

  const showOverlayGate = isPlaying && gate.autoplayBlocked && !gate.played;

  return (
    <div className='relative'>
      <div data-testid='video-wrapper' className={cn('relative', VIDEO_WRAPPER_CLASS)}>
        {!isPlaying ? (
          <BlankPlaceholder />
        ) : (
          <YoutubePlayer
            key={`video-${gate.playerReady}-${gate.played}`}
            url={`https://www.youtube.com/watch?v=${videoId}`}
            playing={gate.playerReady}
            volume={muted ? 0 : volume}
            muted={muted}
            width='100%'
            height='100%'
            className='bg-black rounded'
            onReady={(player: TReactPlayer) => {
              playerRef.current = player;
              seekToLive();
              gate.onReady(player);
            }}
            onStart={() => {
              seekToLive();
              gate.onStart();
            }}
            onPlay={gate.onPlay}
            onPause={gate.onPause}
            config={config}
          />
        )}
        {showOverlayGate && (
          <button
            type='button'
            data-testid='autoplay-gesture-gate'
            aria-label='클릭하여 재생'
            onClick={gate.handleGesturePlay}
            className='absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-black/70 cursor-pointer'
          >
            <span className='flex items-center justify-center w-16 h-16 rounded-full bg-white/90'>
              <svg width='28' height='28' viewBox='0 0 24 24' fill='black' aria-hidden>
                <path d='M8 5v14l11-7z' />
              </svg>
            </span>
            <span className='text-sm text-gray-100'>클릭하여 재생</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default VideoFrame;

const config: YouTubeConfig = {
  playerVars: { controls: 0, autoplay: 1, modestbranding: 1, rel: 0, autohide: 1 },
};
