import silent from './silent';

describe('silent', () => {
  test('성공 시 true 반환', async () => {
    const result = await silent(Promise.resolve('data'));
    expect(result).toBe(true);
  });

  test('실패 시 false 반환', async () => {
    const result = await silent(Promise.reject(new Error('fail')));
    expect(result).toBe(false);
  });

  test('성공 시 onSuccess 콜백 호출', async () => {
    const onSuccess = jest.fn();
    await silent(Promise.resolve('data'), { onSuccess });
    expect(onSuccess).toHaveBeenCalledWith('data');
  });

  test('실패 시 onError 콜백 호출', async () => {
    const error = new Error('fail');
    const onError = jest.fn();
    await silent(Promise.reject(error), { onError });
    expect(onError).toHaveBeenCalledWith(error);
  });

  test('성공 시 onSettled 콜백 호출', async () => {
    const onSettled = jest.fn();
    await silent(Promise.resolve('data'), { onSettled });
    expect(onSettled).toHaveBeenCalledTimes(1);
  });

  test('실패 시에도 onSettled 콜백 호출', async () => {
    const onSettled = jest.fn();
    await silent(Promise.reject(new Error('fail')), { onSettled });
    expect(onSettled).toHaveBeenCalledTimes(1);
  });

  test('성공 시 onError 호출되지 않음', async () => {
    const onError = jest.fn();
    await silent(Promise.resolve('data'), { onError });
    expect(onError).not.toHaveBeenCalled();
  });

  test('실패 시 onSuccess 호출되지 않음', async () => {
    const onSuccess = jest.fn();
    await silent(Promise.reject(new Error('fail')), { onSuccess });
    expect(onSuccess).not.toHaveBeenCalled();
  });

  test('옵션 없이도 정상 동작', async () => {
    await expect(silent(Promise.resolve('data'))).resolves.toBe(true);
    await expect(silent(Promise.reject(new Error('fail')))).resolves.toBe(false);
  });
});
