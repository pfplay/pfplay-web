jest.mock('./network-log', () => ({
  printRequestLog: jest.fn(),
  printResponseLog: jest.fn(),
  printErrorLog: jest.fn(),
}));

jest.mock('@/shared/api/http/error/get-error-message', () => ({
  getErrorMessage: jest.fn((err: Error) => err.message),
}));

import { printRequestLog, printResponseLog, printErrorLog } from './network-log';
import withLog from './with-log';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('withLog', () => {
  test('성공 시 요청/응답 로그 출력 후 결과 반환', async () => {
    const fn = Object.defineProperty(async (a: number) => a * 2, 'name', { value: 'testFn' });
    const wrapped = withLog(fn, 'get');

    const result = await wrapped(5);

    expect(result).toBe(10);
    expect(printRequestLog).toHaveBeenCalledWith({
      method: 'get',
      endPoint: 'testFn',
      requestData: [5],
    });
    expect(printResponseLog).toHaveBeenCalledWith({
      method: 'get',
      endPoint: 'testFn',
      response: 10,
    });
    expect(printErrorLog).not.toHaveBeenCalled();
  });

  test('에러 시 에러 로그 출력 후 에러 재throw', async () => {
    const error = new Error('test error');
    const fn = Object.defineProperty(
      async () => {
        throw error;
      },
      'name',
      { value: 'failFn' }
    );
    const wrapped = withLog(fn, 'post');

    await expect(wrapped()).rejects.toThrow('test error');
    expect(printErrorLog).toHaveBeenCalledWith({
      method: 'post',
      endPoint: 'failFn',
      errorMessage: 'test error',
      error,
    });
    expect(printResponseLog).not.toHaveBeenCalled();
  });
});
