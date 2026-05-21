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

  test('절반 높이(80) → width=60', () => {
    const result = calculateDimensions(80);
    expect(result.width).toBe(60);
  });

  test('scale → zoom 반영', () => {
    const result = calculateDimensions(BODY_BASE_HEIGHT, 0, 0, 0, 0, 2.5);
    expect(result.zoom).toBe(2.5);
  });

  test('scale 가 0 이하(비정상 데이터)면 zoom 을 1 로 방어한다', () => {
    // scale 은 배율 단위(1=원본)다. AvatarSetting.scale 기본값(0.0) 이나 잘못된
    // 음수/0 이 들어오면 transform: scale(0) 으로 face 가 사라져 까맣게 보이므로,
    // 0 이하일 때는 1(원본)로 보정한다.
    expect(calculateDimensions(BODY_BASE_HEIGHT, 0, 0, 0, 0, 0).zoom).toBe(1);
    expect(calculateDimensions(BODY_BASE_HEIGHT, 0, 0, 0, 0, -1).zoom).toBe(1);
  });

  test('x, y offset 계산', () => {
    const result = calculateDimensions(BODY_BASE_HEIGHT, 0, 0, 0.5, 0.3, 1);
    const expectedFaceWidth = BODY_BASE_WIDTH * FACE_BASE_WIDTH_RATIO;
    const expectedFaceHeight = BODY_BASE_HEIGHT * FACE_BASE_HEIGHT_RATIO;
    expect(result.offsetX).toBeCloseTo(0.5 * expectedFaceWidth);
    expect(result.offsetY).toBeCloseTo(0.3 * expectedFaceHeight);
  });
});
