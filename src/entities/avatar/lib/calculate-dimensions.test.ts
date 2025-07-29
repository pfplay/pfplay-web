import calculateDimensions from './calculate-dimensions';
import {
  BODY_BASE_HEIGHT,
  BODY_BASE_WIDTH,
  FACE_BASE_HEIGHT_RATIO,
  FACE_BASE_WIDTH_RATIO,
} from '../config/base-size';
import { DEFAULT_FACE_POS } from '../ui/react-moveable/moveable-face';

describe('calculateDimensions', () => {
  const facePosX = 12;
  const facePosY = 10;
  const facePos = {
    offsetX: 0,
    offsetY: 0,
    zoom: 100,
  };

  test('height BODY_BASE_HEIGHT', () => {
    const result = calculateDimensions(BODY_BASE_HEIGHT, facePosX, facePosY, facePos);
    expect(result).toEqual({
      width: BODY_BASE_WIDTH,
      facePosX: 12,
      facePosY: 10,
      faceWidth: BODY_BASE_WIDTH * FACE_BASE_WIDTH_RATIO,
      faceHeight: BODY_BASE_HEIGHT * FACE_BASE_HEIGHT_RATIO,
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
    });
  });

  test('height 240', () => {
    const result = calculateDimensions(240, facePosX, facePosY, facePos);
    expect(result).toEqual({
      width: 180,
      facePosX: 18,
      facePosY: 15,
      faceWidth: 180 * FACE_BASE_WIDTH_RATIO,
      faceHeight: 240 * FACE_BASE_HEIGHT_RATIO,
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
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
      zoom: DEFAULT_FACE_POS.zoom / 100,
      offsetX: (DEFAULT_FACE_POS.offsetX / 100) * (180 * FACE_BASE_WIDTH_RATIO),
      offsetY: (DEFAULT_FACE_POS.offsetY / 100) * (240 * FACE_BASE_HEIGHT_RATIO),
    });
  });
});
