import dynamic from 'next/dynamic';
import { memo, useEffect, useRef } from 'react';

const ReactionLottie = dynamic(
  () => import('@/entities/avatar/ui/reaction-lottie').then((mod) => mod.ReactionLottie),
  { ssr: false }
);
import { AvatarCompositionType, MotionType, ReactionType } from '@/shared/api/http/types/@enums';
import { AvatarFacePos } from '@/shared/api/http/types/users';
import { cn } from '@/shared/lib/functions/cn';
import calculateDimensions from '../lib/calculate-dimensions';
import { Model } from '../model/avatar.model';

const MoveableFace = dynamic(
  () => import('./react-moveable/moveable-face').then((mod) => mod.MoveableFace),
  { ssr: false }
);

type Props = Model & {
  height: number;
  reaction?: ReactionType;
  motionType?: MotionType;
  /**
   * 함수가 있으면 얼굴 위치 조정 가능, 없으면 얼굴 위치 조정 불가능
   */
  onFacePosChange?: (facePos: AvatarFacePos) => void;
  avatarRef?: (el: HTMLElement | null, type: MotionType) => void;
};

/**
 * - 모든 아바타의 비율은 피그마 시안에 따라 3:4로 고정됩니다.
 * - facePosX, facePosY는 body 이미지 중 아바타의 얼굴이 위치할 좌표를 나타냅니다.
 *   - facePosX: face의 BODY_BASE_WIDTH 기준 x축 위치. face width 중앙까지 측정한 값
 *   - facePosY: face의 BODY_BASE_HEIGHT 기준 y축 위치. face height 상단까지 측정한 값
 * - facePosX, facePosY는 너비 120, 높이 160 기준으로 계산된 값이여야 합니다.
 * - x, y, scale는 얼굴 너비 대비 비율로 계산된 값이여야 합니다.
 */
const Avatar = memo(
  ({
    height,
    bodyUri,
    compositionType,
    faceUri,
    facePosX,
    facePosY,
    reaction,
    motionType,
    offsetX,
    offsetY,
    scale,
    onFacePosChange,
    avatarRef,
  }: Props) => {
    const dimensions = calculateDimensions(height, facePosX, facePosY, offsetX, offsetY, scale);
    const faceImgRef = useRef<HTMLImageElement>(null);

    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
      avatarRef?.(ref.current, motionType ?? MotionType.NONE);
    }, [motionType, avatarRef]);

    return (
      <div
        ref={ref}
        aria-label='Avatar View'
        role='presentation'
        className={cn('relative will-change-transform')}
        style={{
          width: dimensions.width,
          minWidth: dimensions.width,
          height,
          background: `url(${bodyUri}) no-repeat center center / contain`,
        }}
      >
        {reaction && (
          <div
            aria-label='Avatar Reaction'
            role='presentation'
            className='absolute left-1/2 -top-6 transform -translate-x-1/2 -z-1'
          >
            <ReactionLottie reaction={reaction} />
          </div>
        )}

        {compositionType === AvatarCompositionType.BODY_WITH_FACE && faceUri && (
          <div
            className='absolute transform -translate-x-1/2 -z-1'
            style={{
              width: dimensions.faceWidth,
              height: dimensions.faceHeight,
              left: `${dimensions.facePosX}px`,
              top: `${dimensions.facePosY}px`,
            }}
          >
            <div
              className='relative w-full h-full'
              style={{ clipPath: 'ellipse(50% 50% at 50% 50%)' }}
            >
              <img
                ref={faceImgRef}
                src={faceUri}
                alt='Avatar Face'
                className='w-full h-full object-cover origin-center transition-transform'
                style={{
                  transform: `translate(${dimensions.offsetX}px, ${dimensions.offsetY}px) scale(${dimensions.zoom})`,
                }}
              />
            </div>
            {onFacePosChange && (
              <MoveableFace
                faceRef={faceImgRef}
                onFacePosChange={onFacePosChange}
                faceWidth={dimensions.faceWidth}
                faceHeight={dimensions.faceHeight}
              />
            )}
          </div>
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

export default Avatar;
