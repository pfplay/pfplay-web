import { memo, useRef } from 'react';
import { cn } from '@/shared/lib/functions/cn';
import calculateDimensions from '../lib/calculate-dimensions';
import { Model } from '../model/avatar.model';

type Props = Model & {
  height: number;
  dance?: boolean;
};

/**
 * - 모든 아바타의 비율은 피그마 시안에 따라 3:4로 고정됩니다.
 * - facePosX, facePosY는 body 이미지 중 아바타의 얼굴이 위치할 좌표를 나타냅니다.
 *   - facePosX: face의 BODY_BASE_WIDTH 기준 x축 위치. face width 중앙까지 측정한 값
 *   - facePosY: face의 BODY_BASE_HEIGHT 기준 y축 위치. face height 상단까지 측정한 값
 * - facePosX, facePosY는 너비 120, 높이 160 기준으로 계산된 값이여야 합니다.
 */
const Avatar = memo(({ height, bodyUri, faceUri, facePosX, facePosY, dance }: Props) => {
  const dimensions = calculateDimensions(height, facePosX, facePosY);
  const fixedRandomSeconds = useRef(`${Math.random() * 0.5}s`).current;

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
      {faceUri && (
        <div
          aria-label='Avatar Face'
          role='presentation'
          className='absolute transform -translate-x-1/2 -z-1'
          style={{
            width: dimensions.faceWidth,
            height: dimensions.faceHeight,
            left: `${dimensions.facePosX}px`,
            top: `${dimensions.facePosY}px`,
            background: `url(${faceUri}) no-repeat center center / cover`,
            clipPath: 'ellipse(50% 50% at 50% 50%)',
          }}
        />
      )}
    </div>
  );
});

Avatar.displayName = 'Avatar';

export default Avatar;
