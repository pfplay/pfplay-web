import { repeatAnimationFrame } from './repeat-animation-frame';

describe('repeatAnimationFrame', () => {
  let rafCallback: FrameRequestCallback;

  beforeEach(() => {
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      rafCallback = cb;
      return 0;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('repeat이 0이면 즉시 콜백 실행', () => {
    const callback = vi.fn();
    repeatAnimationFrame(callback, 0);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(window.requestAnimationFrame).not.toHaveBeenCalled();
  });

  test('repeat이 1이면 requestAnimationFrame 1회 후 콜백 실행', () => {
    const callback = vi.fn();
    repeatAnimationFrame(callback, 1);

    expect(callback).not.toHaveBeenCalled();
    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1);

    rafCallback(0);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test('repeat이 음수면 즉시 콜백 실행', () => {
    const callback = vi.fn();
    repeatAnimationFrame(callback, -1);
    expect(callback).toHaveBeenCalledTimes(1);
  });
});
