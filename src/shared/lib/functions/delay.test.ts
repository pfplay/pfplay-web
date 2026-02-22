import { delay } from './delay';

describe('delay', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('지정된 시간 후 resolve', async () => {
    const callback = jest.fn();

    delay(1000).then(callback);

    expect(callback).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1000);
    await Promise.resolve();

    expect(callback).toHaveBeenCalledTimes(1);
  });

  test('0ms delay도 정상 동작', async () => {
    const callback = jest.fn();

    delay(0).then(callback);

    jest.advanceTimersByTime(0);
    await Promise.resolve();

    expect(callback).toHaveBeenCalledTimes(1);
  });

  test('Promise<void> 반환', async () => {
    const promise = delay(100);
    jest.advanceTimersByTime(100);
    await expect(promise).resolves.toBeUndefined();
  });
});
