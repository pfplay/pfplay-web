vi.mock('./logger', () => ({
  infoLog: vi.fn(),
  successLog: vi.fn(),
  errorLog: vi.fn(),
}));

import { infoLog, successLog, errorLog } from './logger';
import { printRequestLog, printResponseLog, printErrorLog } from './network-log';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('network-log', () => {
  describe('printRequestLog', () => {
    test('클라이언트 환경에서 요청 바디 로그 출력', () => {
      printRequestLog({
        method: 'post',
        endPoint: '/api/users',
        requestData: { name: 'test' },
      });

      expect(infoLog).toHaveBeenCalledWith('POST /api/users [REQ BODY]', { name: 'test' });
    });

    test('클라이언트 환경에서 요청 파라미터가 있으면 파라미터 로그도 출력', () => {
      printRequestLog({
        method: 'get',
        endPoint: '/api/users',
        requestParams: { page: 1 },
      });

      expect(infoLog).toHaveBeenCalledWith('GET /api/users [REQ PARAMS]', { page: 1 });
    });

    test('빈 requestParams는 파라미터 로그 출력 안 함', () => {
      printRequestLog({
        method: 'get',
        endPoint: '/api/users',
        requestParams: {},
      });

      expect(infoLog).toHaveBeenCalledTimes(1);
      expect(infoLog).toHaveBeenCalledWith('GET /api/users [REQ BODY]', undefined);
    });
  });

  describe('printResponseLog', () => {
    test('클라이언트 환경에서 응답 로그 출력', () => {
      printResponseLog({
        method: 'get',
        endPoint: '/api/users',
        response: { data: [] },
      });

      expect(successLog).toHaveBeenCalledWith('GET /api/users [RES BODY]', { data: [] });
    });
  });

  describe('printErrorLog', () => {
    test('클라이언트 환경에서 에러 로그 출력', () => {
      const error = new Error('fail');
      printErrorLog({
        method: 'post',
        endPoint: '/api/users',
        errorMessage: 'fail',
        error,
      });

      expect(errorLog).toHaveBeenCalledWith('POST /api/users [ERR]', 'fail', error);
    });
  });
});
