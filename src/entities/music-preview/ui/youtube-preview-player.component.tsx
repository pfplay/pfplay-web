'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState, useRef } from 'react';
import type TReactPlayer from 'react-player';
import { cn } from '@/shared/lib/functions/cn';
import { useStores } from '@/shared/lib/store/stores.context';
import { LoadingPanel } from '@/shared/ui/components/loading';
import { TextButton } from '@/shared/ui/components/text-button';
import { PFClose, PFVolumeOff, PFVolumeOn } from '@/shared/ui/icons';
import { previewPlayerConfig } from '../config/youtube-player.config';
import { previewPlayerAPI } from '../lib/react-player.api';

// Dynamic import to avoid SSR issues
const YoutubePlayer = dynamic(() => import('react-player/youtube'), { ssr: false });

type YouTubePreviewPlayerProps = {
  /** 플레이어 크기 */
  width: number;
  height: number;
  /** 추가 CSS 클래스 */
  className?: string;
  /** 닫기 버튼 표시 여부 */
  showCloseButton?: boolean;
  /** 닫기 버튼 클릭 핸들러 */
  onClose?: () => void;
};

/**
 * YouTube 미리보기 전용 플레이어
 * 기존 video.component.tsx를 참고하여 미리보기용으로 최적화
 */
export default function YouTubePreviewPlayer({
  width,
  height,
  className,
  showCloseButton = true,
  onClose,
}: YouTubePreviewPlayerProps) {
  const { useMusicPreview } = useStores();
  const { currentTrack, playState, playerReady, setPlayerReady, stopPreview } = useMusicPreview();

  const [played, setPlayed] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const playerRef = useRef<TReactPlayer | null>(null);

  const videoId = currentTrack?.id;
  const videoUrl = currentTrack?.videoUrl;
  const isPlaying = playState === 'playing';
  const playable = !!videoId && playerReady && isPlaying;

  /**
   * 플레이어 준비 완료 핸들러
   */
  const onPlayerReady = (player: TReactPlayer) => {
    playerRef.current = player;
    previewPlayerAPI.setPlayer(player);

    // 미리보기는 처음부터 시작
    player.seekTo(0, 'seconds');
    player.forceUpdate();

    setPlayerReady(true);
  };

  /**
   * 재생 시작 핸들러
   */
  const onPlay = () => {
    setPlayed(true);
  };

  /**
   * 재생 종료 핸들러
   */
  const onEnded = () => {
    stopPreview();
  };

  /**
   * 오류 발생 핸들러
   */
  const onError = (error: any) => {
    console.error('YouTube 플레이어 오류:', error);
    stopPreview();
  };

  /**
   * 닫기 핸들러
   */
  const handleClose = () => {
    stopPreview();
    onClose?.();
  };

  /**
   * 새 트랙 선택 시 음소거 리셋
   */
  useEffect(() => {
    setIsMuted(true);
  }, [videoId]);

  /**
   * 플레이어 정리
   */
  useEffect(() => {
    return () => {
      previewPlayerAPI.cleanup();
    };
  }, []);

  /**
   * 재생 상태가 변경될 때 플레이어 제어
   */
  useEffect(() => {
    if (playerReady && playerRef.current) {
      if (isPlaying) {
        previewPlayerAPI.play();
      } else {
        previewPlayerAPI.stop();
      }
    }
  }, [isPlaying, playerReady]);

  if (!currentTrack || !videoUrl) {
    return null;
  }

  return (
    <div className={cn('relative bg-black border border-gray-700 rounded', className)}>
      {/* 로딩 상태 */}
      {!playable && (
        <div style={{ width, height }} className='bg-black flex items-center justify-center'>
          <LoadingPanel />
        </div>
      )}

      {/* YouTube 플레이어 */}
      <YoutubePlayer
        key={`preview-${videoId}-${playerReady}-${played}`} // 상태 변경 시 리렌더링
        playing={playerReady && isPlaying}
        width={width}
        height={height}
        url={videoUrl}
        className={cn('bg-black rounded', {
          hidden: !playable,
          'pointer-events-auto': played, // 재생 시작 후 컨트롤 허용
        })}
        onReady={onPlayerReady}
        onPlay={onPlay}
        onEnded={onEnded}
        onError={onError}
        config={previewPlayerConfig}
        pip={false}
        muted={isMuted}
      />

      {/* 음소거 토글 버튼 */}
      <div className='absolute top-2 left-2 z-10'>
        <TextButton
          onClick={() => setIsMuted((prev) => !prev)}
          Icon={
            isMuted ? <PFVolumeOff width={20} height={20} /> : <PFVolumeOn width={20} height={20} />
          }
          className='bg-black bg-opacity-50 hover:bg-opacity-75 text-white rounded-full p-1 transition-all'
        />
      </div>

      {/* 닫기 버튼 */}
      {showCloseButton && (
        <div className='absolute top-2 right-2 z-10'>
          <TextButton
            onClick={handleClose}
            Icon={<PFClose width={20} height={20} />}
            className='bg-black bg-opacity-50 hover:bg-opacity-75 text-white rounded-full p-1 transition-all'
          />
        </div>
      )}

      {/* 트랙 정보 오버레이 */}
      <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3'>
        <div className='text-white text-sm truncate'>{currentTrack.title}</div>
      </div>
    </div>
  );
}
