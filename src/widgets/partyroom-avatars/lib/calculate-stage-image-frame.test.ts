import { calculateStageImageFrame } from './calculate-stage-image-frame';

describe('calculateStageImageFrame', () => {
  test('16:9보다 넓은 화면에서는 좌측 고정, 하단 크롭 오프셋을 계산한다', () => {
    const frame = calculateStageImageFrame({ width: 2560, height: 1080 });

    expect(frame.width).toBe(2560);
    expect(frame.height).toBe(1440);
    expect(frame.offsetX).toBe(0);
    expect(frame.offsetY).toBe(-360);
  });

  test('16:9보다 좁은 화면에서는 전체 높이를 맞추고 우측만 확장한다', () => {
    const frame = calculateStageImageFrame({ width: 1080, height: 1920 });

    expect(frame.width).toBeCloseTo(3413.3333333333335);
    expect(frame.height).toBe(1920);
    expect(frame.offsetX).toBe(0);
    expect(frame.offsetY).toBe(0);
  });

  test('빈 컨테이너에서는 0 프레임을 반환한다', () => {
    expect(calculateStageImageFrame({ width: 0, height: 0 })).toEqual({
      width: 0,
      height: 0,
      offsetX: 0,
      offsetY: 0,
    });
  });
});
