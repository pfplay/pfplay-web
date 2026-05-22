import { PARTYROOM_BACKGROUND } from '../model/constants';

type StageBounds = {
  width: number;
  height: number;
};

export type StageImageFrame = StageBounds & {
  offsetX: number;
  offsetY: number;
};

/**
 * `background-size: cover` + `background-position: left bottom` 기준으로
 * 실제 배경 이미지가 렌더된 프레임을 계산한다.
 */
export function calculateStageImageFrame(container: StageBounds): StageImageFrame {
  if (container.width <= 0 || container.height <= 0) {
    return {
      width: 0,
      height: 0,
      offsetX: 0,
      offsetY: 0,
    };
  }

  const scale = Math.max(
    container.width / PARTYROOM_BACKGROUND.WIDTH,
    container.height / PARTYROOM_BACKGROUND.HEIGHT
  );
  const width = PARTYROOM_BACKGROUND.WIDTH * scale;
  const height = PARTYROOM_BACKGROUND.HEIGHT * scale;

  return {
    width,
    height,
    offsetX: 0,
    offsetY: container.height - height,
  };
}
