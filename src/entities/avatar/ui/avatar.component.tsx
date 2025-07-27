import { memo, useRef } from 'react';
import { ReactionLottie } from '@/entities/avatar/ui/reaction-lottie';
import { ReactionType } from '@/shared/api/http/types/@enums';
import { cn } from '@/shared/lib/functions/cn';
import calculateDimensions from '../lib/calculate-dimensions';
import { FacePos, Model } from '../model/avatar.model';
import { DEFAULT_FACE_POS, MoveableFace } from './react-moveable/moveable-face';

type Props = Model & {
  height: number;
  dance?: boolean;
  reaction?: ReactionType;
  /**
   * 함수가 있으면 얼굴 위치 조정 가능, 없으면 얼굴 위치 조정 불가능
   */
  onFacePosChange?: (facePos: FacePos) => void;
};

/**
 * - 모든 아바타의 비율은 피그마 시안에 따라 3:4로 고정됩니다.
 * - facePosX, facePosY는 body 이미지 중 아바타의 얼굴이 위치할 좌표를 나타냅니다.
 *   - facePosX: face의 BODY_BASE_WIDTH 기준 x축 위치. face width 중앙까지 측정한 값
 *   - facePosY: face의 BODY_BASE_HEIGHT 기준 y축 위치. face height 상단까지 측정한 값
 * - facePosX, facePosY는 너비 120, 높이 160 기준으로 계산된 값이여야 합니다.
 */
const Avatar = memo(
  ({
    height,
    bodyUri,
    faceUri,
    facePosX,
    facePosY,
    dance,
    reaction,
    facePos,
    onFacePosChange,
  }: Props) => {
    const dimensions = calculateDimensions(height, facePosX, facePosY, facePos ?? DEFAULT_FACE_POS);
    const fixedRandomSeconds = useRef(`${Math.random() * 0.5}s`).current;
    const faceImgRef = useRef<HTMLImageElement>(null);

    return (
      <div
        aria-label='Avatar View'
        role='presentation'
        className={cn('relative', {
          'animate-bounce': dance,
        })}
        style={{
          width: dimensions.width,
          minWidth: dimensions.width,
          height,
          background: `url(${bodyUri}) no-repeat center center / contain`,
          /**
           * 한 화면에 여러 아바타가 춤을 출 때, 각 아바타의 춤 출 시작 시간에 미세한 차이를 두어 너무 기계적으로 보이지 않게하기 위한 딜레이입니다.
           */
          animationDelay: dance ? fixedRandomSeconds : undefined,
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

        {faceUri && (
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
