import { MoveableHelper } from './moveable.helper';

const FACE_WIDTH = 200;
const FACE_HEIGHT = 300;

function createHelper(
  initialFacePos?: { offsetX: number; offsetY: number; scale: number },
  onFacePosChange = vi.fn()
) {
  return {
    helper: new MoveableHelper(initialFacePos, onFacePosChange, FACE_WIDTH, FACE_HEIGHT),
    onFacePosChange,
  };
}

describe('MoveableHelper', () => {
  describe('constructor', () => {
    test('initialFacePos가 undefined이면 기본값 { offsetX: 0, offsetY: 0, scale: 1 }을 사용한다', () => {
      const { helper, onFacePosChange } = createHelper(undefined);
      // 기본값을 확인하기 위해 onScale 호출로 현재 facePos를 드러낸다
      helper.onScale({ scale: [2] });
      expect(onFacePosChange).toHaveBeenCalledWith({ offsetX: 0, offsetY: 0, scale: 2 });
    });

    test('initialFacePos가 제공되면 그대로 저장한다', () => {
      const initial = { offsetX: 0.5, offsetY: 0.3, scale: 1.5 };
      const { helper, onFacePosChange } = createHelper(initial);
      // onScale로 scale만 변경하여 나머지 값 확인
      helper.onScale({ scale: [2] });
      expect(onFacePosChange).toHaveBeenCalledWith({ offsetX: 0.5, offsetY: 0.3, scale: 2 });
    });
  });

  describe('onDrag', () => {
    test('offsetX = x / faceWidth, offsetY = y / faceHeight로 계산한다', () => {
      const { helper, onFacePosChange } = createHelper();
      helper.onDrag({ beforeTranslate: [100, 150] });
      expect(onFacePosChange).toHaveBeenCalledWith({
        offsetX: 100 / FACE_WIDTH,
        offsetY: 150 / FACE_HEIGHT,
        scale: 1,
      });
    });

    test('기존 scale 값을 유지한다', () => {
      const { helper, onFacePosChange } = createHelper({ offsetX: 0, offsetY: 0, scale: 2.5 });
      helper.onDrag({ beforeTranslate: [50, 60] });
      expect(onFacePosChange).toHaveBeenCalledWith({
        offsetX: 50 / FACE_WIDTH,
        offsetY: 60 / FACE_HEIGHT,
        scale: 2.5,
      });
    });
  });

  describe('onScale', () => {
    test('scale = zoomRatio로 설정하고 기존 offset을 유지한다', () => {
      const initial = { offsetX: 0.4, offsetY: 0.6, scale: 1 };
      const { helper, onFacePosChange } = createHelper(initial);
      helper.onScale({ scale: [3] });
      expect(onFacePosChange).toHaveBeenCalledWith({ offsetX: 0.4, offsetY: 0.6, scale: 3 });
    });
  });

  test('drag → scale 연속 호출 시 모든 필드가 올바르게 유지된다', () => {
    const { helper, onFacePosChange } = createHelper();

    helper.onDrag({ beforeTranslate: [80, 120] });
    expect(onFacePosChange).toHaveBeenLastCalledWith({
      offsetX: 80 / FACE_WIDTH,
      offsetY: 120 / FACE_HEIGHT,
      scale: 1,
    });

    helper.onScale({ scale: [1.5] });
    expect(onFacePosChange).toHaveBeenLastCalledWith({
      offsetX: 80 / FACE_WIDTH,
      offsetY: 120 / FACE_HEIGHT,
      scale: 1.5,
    });
  });
});
