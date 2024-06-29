import calculateDimensions from '../lib/calculate-dimensions';
import { Model } from '../model/avatar.model';

type Props = Model & {
  height: number;
};

/**
 * - 모든 아바타의 비율은 피그마 시안에 따라 3:4로 고정됩니다.
 * - facePosX, facePosY는 body 이미지 중 아바타의 얼굴이 위치할 좌표를 나타냅니다.
 *   - facePosX: face의 BODY_BASE_WIDTH 기준 x축 위치. face width 중앙까지 측정한 값
 *   - facePosY: face의 BODY_BASE_HEIGHT 기준 y축 위치. face height 상단까지 측정한 값
 * - facePosX, facePosY는 너비 120, 높이 160 기준으로 계산된 값이여야 합니다.
 */
export default function Avatar({ height, bodyUri, faceUri, facePosX, facePosY }: Props) {
  const dimensions = calculateDimensions(height, facePosX, facePosY);

  return (
    <div
      aria-label='Avatar View'
      role='presentation'
      className='relative'
      style={{
        width: dimensions.width,
        minWidth: dimensions.width,
        height,
        background: `url(${bodyUri}) no-repeat center center / contain`,
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
}
