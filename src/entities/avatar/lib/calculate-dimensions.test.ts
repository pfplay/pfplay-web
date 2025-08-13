import calculateDimensions from './calculate-dimensions';
import {
  BASE_SCALE,
  BASE_X,
  BASE_Y,
  BODY_BASE_HEIGHT,
  BODY_BASE_WIDTH,
  FACE_BASE_HEIGHT_RATIO,
  FACE_BASE_WIDTH_RATIO,
} from '../config/base-size';

describe('calculateDimensions', () => {
  const facePosX = 12;
  const facePosY = 10;
  const x = 0;
  const y = 0;
  const scale = 1;

  test('height BODY_BASE_HEIGHT', () => {
    const result = calculateDimensions(BODY_BASE_HEIGHT, facePosX, facePosY, x, y, scale);
    expect(result).toEqual({
      width: BODY_BASE_WIDTH,
      facePosX: 12,
      facePosY: 10,
      faceWidth: BODY_BASE_WIDTH * FACE_BASE_WIDTH_RATIO,
      faceHeight: BODY_BASE_HEIGHT * FACE_BASE_HEIGHT_RATIO,
      zoom: BASE_SCALE,
      offsetX: BASE_X,
      offsetY: BASE_Y,
    });
  });

  test('height 240', () => {
    const result = calculateDimensions(240, facePosX, facePosY, x, y, scale);
    expect(result).toEqual({
      width: 180,
      facePosX: 18,
      facePosY: 15,
      faceWidth: 180 * FACE_BASE_WIDTH_RATIO,
      faceHeight: 240 * FACE_BASE_HEIGHT_RATIO,
      zoom: BASE_SCALE,
      offsetX: BASE_X,
      offsetY: BASE_Y,
    });
  });

  test('height 240, without posX, posY', () => {
    const result = calculateDimensions(240);
    expect(result).toEqual({
      width: 180,
      facePosX: 0,
      facePosY: 0,
      faceWidth: 180 * FACE_BASE_WIDTH_RATIO,
      faceHeight: 240 * FACE_BASE_HEIGHT_RATIO,
      zoom: BASE_SCALE,
      offsetX: BASE_X,
      offsetY: BASE_Y,
    });
  });
});
