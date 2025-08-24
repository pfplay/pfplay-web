'use client';

import Image from 'next/image';
import { useStores } from '@/shared/lib/store/stores.context';
import PreviewIndicator from './preview-indicator.component';
import PreviewOverlay from './preview-overlay.component';
import type { Preview } from '../model/preview.model';

type ThumbnailWithPreviewProps = {
  /** 미리보기 트랙 정보 */
  previewTrack: Preview.PreviewTrack;
  /** 썸네일 이미지 src */
  thumbnailSrc: string;
  /** 썸네일 alt 텍스트 */
  thumbnailAlt: string;
  /** 썸네일 너비 */
  width: number;
  /** 썸네일 높이 */
  height: number;
  /** 추가 CSS 클래스 */
  className?: string;
  /** 이미지 추가 CSS 클래스 */
  imageClassName?: string;
};

/**
 * 미리보기 기능이 통합된 썸네일 컴포넌트
 * 기존 Image 컴포넌트를 래핑하여 미리보기 기능을 추가
 */
export default function ThumbnailWithPreview({
  previewTrack,
  thumbnailSrc,
  thumbnailAlt,
  width,
  height,
  className,
  imageClassName,
}: ThumbnailWithPreviewProps) {
  const { useMusicPreview } = useStores();
  const musicPreviewStore = useMusicPreview();

  // 안전하게 스토어 메서드들을 추출
  const startPreview = musicPreviewStore?.startPreview;
  const stopPreview = musicPreviewStore?.stopPreview;
  const isTrackPlaying = musicPreviewStore?.isTrackPlaying;

  // 스토어가 초기화되지 않았을 경우 기본값 반환
  if (!musicPreviewStore || !startPreview || !stopPreview || !isTrackPlaying) {
    return (
      <div className={`relative ${className || ''}`}>
        <Image
          src={thumbnailSrc}
          alt={thumbnailAlt}
          width={width}
          height={height}
          className={imageClassName}
          priority
        />
      </div>
    );
  }

  const isPlaying = isTrackPlaying(previewTrack.id);

  const handlePlay = () => {
    startPreview(previewTrack);
  };

  const handleStop = () => {
    stopPreview();
  };

  return (
    <div className={`relative ${className || ''}`}>
      {/* 기본 썸네일 이미지 */}
      <Image
        src={thumbnailSrc}
        alt={thumbnailAlt}
        width={width}
        height={height}
        className={imageClassName}
        priority
      />

      {/* 재생중 상태 표시 (항상 표시) */}
      {isPlaying && <PreviewIndicator />}

      {/* 호버 시 재생/중단 버튼 (호버시에만 표시) */}
      <PreviewOverlay isPlaying={isPlaying} onPlay={handlePlay} onStop={handleStop} />
    </div>
  );
}
