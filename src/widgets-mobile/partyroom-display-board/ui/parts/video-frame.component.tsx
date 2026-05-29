'use client';
import dynamic from 'next/dynamic';
import { FC, RefObject } from 'react';
import type TReactPlayer from 'react-player';
import { YouTubeConfig } from 'react-player/youtube';
import { useUserPreferenceStore } from '@/entities/preference';
import { cn } from '@/shared/lib/functions/cn';
import BlankPlaceholder from './blank-placeholder.component';
import ExpandToggle from './expand-toggle.component';
import type { AutoplayGestureGate } from '../../lib/use-autoplay-gesture-gate.hook';

const YoutubePlayer = dynamic(() => import('react-player/youtube'), { ssr: false });

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

const VideoFrame: FC<Props> = ({ videoId, expanded, onToggleExpand, playerRef, gate }) => {
  const mode: 'A' | 'B' | 'C' = videoId === null ? 'C' : expanded ? 'A' : 'B';
  const volume = useUserPreferenceStore((s) => s.volume);
  const muted = useUserPreferenceStore((s) => s.muted);

  const showOverlayGate = mode === 'A' && gate.autoplayBlocked && !gate.played;
  const showToggle = mode === 'A' || mode === 'B';

  return (
    <div className='relative'>
      <div data-testid='video-wrapper' className={cn('relative', wrapperClass(mode))}>
        {mode === 'C' ? (
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
              gate.onReady(player);
            }}
            onStart={gate.onStart}
            onPlay={gate.onPlay}
            onPause={gate.onPause}
            config={config}
          />
        )}
        {showOverlayGate && (
          // z-20: autoplay 차단 시 overlay 가 ExpandToggle 을 의도적으로 가린다.
          // 사용자가 토글 접근 전에 먼저 gesture release 를 해야 함 (UX 잠금).
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
        {showToggle && (
          <div className='absolute top-1 right-1 bg-black/40 rounded-full p-1'>
            <ExpandToggle expanded={expanded} onToggle={onToggleExpand} />
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoFrame;

const config: YouTubeConfig = {
  playerVars: { controls: 0, autoplay: 1, modestbranding: 1, rel: 0, autohide: 1 },
};
