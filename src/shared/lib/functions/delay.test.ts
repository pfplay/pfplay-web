import { delay } from './delay';

describe('delay', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('지정된 시간 후 resolve', async () => {
    const callback = vi.fn();

    delay(1000).then(callback);

    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1000);
    await Promise.resolve();

    expect(callback).toHaveBeenCalledTimes(1);
  });

  test('0ms delay도 정상 동작', async () => {
    const callback = vi.fn();

    delay(0).then(callback);

    vi.advanceTimersByTime(0);
    await Promise.resolve();

    expect(callback).toHaveBeenCalledTimes(1);
  });

  test('Promise<void> 반환', async () => {
    const promise = delay(100);
    vi.advanceTimersByTime(100);
    await expect(promise).resolves.toBeUndefined();
  });
});
