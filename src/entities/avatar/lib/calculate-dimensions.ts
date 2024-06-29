import {
  BODY_BASE_HEIGHT,
  BODY_BASE_WIDTH,
  FACE_BASE_HEIGHT_RATIO,
  FACE_BASE_WIDTH_RATIO,
} from '../config/base-size';

/**
 * @description - 아바타의 주어진 높이를 기준으로 새로운 너비, x, y 좌표를 계산
 *
 * @param targetHeight - 원하는 body 높이
 * @param faceBasePosX - BODY_BASE_WIDTH 기준 x 좌표. body별로 고유한 값. combinabl false라면 비어있을 수 있음
 * @param faceBasePosY - BODY_BASE_HEIGHT 기준 y 좌표. body별로 고유한 값. combinable false라면 비어있을 수 있음
 */
export default function calculateDimensions(
  targetHeight: number,
  faceBasePosX: number = 0,
  faceBasePosY: number = 0
) {
  // 높이 비율
  const heightRatio = targetHeight / BODY_BASE_HEIGHT;

  // 새로운 너비, x 좌표, y 좌표, face 너비, face 높이 계산
  const width = BODY_BASE_WIDTH * heightRatio;
  const facePosX = faceBasePosX * heightRatio; // 높이 너비 비율이 항상 동일할 것이라 가정하기에 widthRatio를 사용하지 않아도 됨
  const facePosY = faceBasePosY * heightRatio;
  const faceWidth = width * FACE_BASE_WIDTH_RATIO;
  const faceHeight = targetHeight * FACE_BASE_HEIGHT_RATIO;

  return {
    width,
    facePosX,
    facePosY,
    faceWidth,
    faceHeight,
  };
}
