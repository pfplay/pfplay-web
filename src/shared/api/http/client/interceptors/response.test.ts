jest.mock('@/shared/lib/functions/log/with-debugger', () => ({
  __esModule: true,
  default: () => (fn: any) => fn,
}));

jest.mock('@/shared/lib/functions/log/network-log', () => ({
  printResponseLog: jest.fn(),
  printErrorLog: jest.fn(),
}));

jest.mock('@/shared/api/http/error/get-error-message', () => ({
  getErrorMessage: jest.fn(() => 'mocked error message'),
}));

jest.mock('@/shared/api/http/error/get-error-code', () => ({
  getErrorCode: jest.fn(),
}));

jest.mock('@/shared/api/http/error/error-emitter', () => ({
  __esModule: true,
  default: { emit: jest.fn() },
}));

jest.mock('@/shared/lib/functions/is-pure-object', () => ({
  isPureObject: jest.fn(
    (obj: unknown) => obj !== null && typeof obj === 'object' && !Array.isArray(obj)
  ),
}));

import { AxiosError, AxiosResponse } from 'axios';
import errorEmitter from '@/shared/api/http/error/error-emitter';
import { getErrorCode } from '@/shared/api/http/error/get-error-code';
import { getErrorMessage } from '@/shared/api/http/error/get-error-message';
import { printErrorLog, printResponseLog } from '@/shared/lib/functions/log/network-log';
import { logResponse, unwrapResponse, logError, unwrapError, emitError } from './response';

beforeEach(() => {
  jest.clearAllMocks();
});

function createAxiosResponse(overrides: {
  data?: any;
  method?: string;
  url?: string;
}): AxiosResponse {
  return {
    data: overrides.data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {
      method: overrides.method ?? 'get',
      url: overrides.url ?? '/api/test',
      headers: {} as any,
    },
  };
}

function createAxiosError(overrides: {
  method?: string;
  url?: string;
  responseData?: any;
  hasResponse?: boolean;
}): AxiosError {
  return {
    message: 'Request failed',
    name: 'AxiosError',
    isAxiosError: true,
    toJSON: () => ({}),
    config: {
      method: overrides.method ?? 'post',
      url: overrides.url ?? '/api/test',
      headers: {} as any,
    },
    response:
      overrides.hasResponse === false
        ? undefined
        : {
            data: overrides.responseData ?? {},
            status: 500,
            statusText: 'Internal Server Error',
            headers: {},
            config: { headers: {} as any },
          },
  } as AxiosError;
}

describe('response interceptors', () => {
  describe('logResponse', () => {
    test('응답 로그 출력 후 response 그대로 반환', () => {
      const response = createAxiosResponse({
        data: { data: { id: 1 } },
        method: 'get',
        url: '/api/users',
      });

      const result = logResponse(response);

      expect(printResponseLog).toHaveBeenCalledWith({
        method: 'get',
        endPoint: '/api/users',
        response: { id: 1 },
      });
      expect(result).toBe(response);
    });

    test('data.data 없으면 data 자체를 로그에 사용', () => {
      const response = createAxiosResponse({
        data: { message: 'ok' },
        method: 'post',
        url: '/api/health',
      });

      logResponse(response);

      expect(printResponseLog).toHaveBeenCalledWith({
        method: 'post',
        endPoint: '/api/health',
        response: { message: 'ok' },
      });
    });
  });

  describe('unwrapResponse', () => {
    test('data.data 있으면 data.data 반환', () => {
      const response = createAxiosResponse({ data: { data: { id: 1, name: 'test' } } });

      expect(unwrapResponse(response)).toEqual({ id: 1, name: 'test' });
    });

    test('data.data 없으면 data 반환', () => {
      const response = createAxiosResponse({ data: { message: 'ok' } });

      expect(unwrapResponse(response)).toEqual({ message: 'ok' });
    });
  });

  describe('logError', () => {
    test('getErrorMessage 호출, printErrorLog 호출, Promise.reject 반환', async () => {
      const error = createAxiosError({ method: 'post', url: '/api/users' });

      await expect(logError(error)).rejects.toBe(error);

      expect(getErrorMessage).toHaveBeenCalledWith(error);
      expect(printErrorLog).toHaveBeenCalledWith({
        method: 'post',
        endPoint: '/api/users',
        errorMessage: 'mocked error message',
        error,
      });
    });
  });

  describe('unwrapError', () => {
    test('response.data에 data 프로퍼티 있으면 e.response.data를 data.data로 교체', async () => {
      const error = createAxiosError({
        responseData: { data: { errorCode: 'JWT-001' } },
      });

      await expect(unwrapError(error)).rejects.toBe(error);
      const response = error.response as { data: unknown };
      expect(response.data).toEqual({ errorCode: 'JWT-001' });
    });

    test('response.data에 data 프로퍼티 없으면 그대로 유지', async () => {
      const originalData = { message: 'error' };
      const error = createAxiosError({ responseData: originalData });

      await expect(unwrapError(error)).rejects.toBe(error);
      const response = error.response as { data: unknown };
      expect(response.data).toEqual(originalData);
    });

    test('response 없으면 그대로 reject', async () => {
      const error = createAxiosError({ hasResponse: false });

      await expect(unwrapError(error)).rejects.toBe(error);
    });
  });

  describe('emitError', () => {
    test('유효한 ErrorCode 있으면 errorEmitter.emit 호출', async () => {
      (getErrorCode as jest.Mock).mockReturnValue('JWT-001');

      const error = createAxiosError({});

      await expect(emitError(error)).rejects.toBe(error);
      expect(errorEmitter.emit).toHaveBeenCalledWith('JWT-001');
    });

    test('ErrorCode 없으면 emit 호출 안 함', async () => {
      (getErrorCode as jest.Mock).mockReturnValue(undefined);

      const error = createAxiosError({});

      await expect(emitError(error)).rejects.toBe(error);
      expect(errorEmitter.emit).not.toHaveBeenCalled();
    });

    test('항상 Promise.reject 반환', async () => {
      (getErrorCode as jest.Mock).mockReturnValue(undefined);

      const error = createAxiosError({});

      await expect(emitError(error)).rejects.toBe(error);
    });
  });
});
