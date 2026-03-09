vi.mock('@/shared/lib/functions/log/network-log', () => ({
  printRequestLog: vi.fn(),
}));
vi.mock('@/shared/lib/functions/log/with-debugger', () => ({
  __esModule: true,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  default: () => (logFn: Function) => logFn,
}));

import { InternalAxiosRequestConfig } from 'axios';
import { printRequestLog } from '@/shared/lib/functions/log/network-log';
import { logRequest } from './request';

beforeEach(() => {
  vi.clearAllMocks();
});

function createAxiosRequestConfig(
  overrides: Partial<InternalAxiosRequestConfig> = {}
): InternalAxiosRequestConfig {
  return {
    method: 'get',
    url: '/api/test',
    headers: {} as any,
    ...overrides,
  };
}

describe('logRequest', () => {
  test('config를 그대로 반환한다', () => {
    const config = createAxiosRequestConfig();

    const result = logRequest(config);

    expect(result).toBe(config);
  });

  test('로거에 method, url, params, data를 전달한다', () => {
    const config = createAxiosRequestConfig({
      method: 'post',
      url: '/api/users',
      params: { page: 1 },
      data: { name: 'test' },
    });

    logRequest(config);

    expect(printRequestLog).toHaveBeenCalledWith({
      method: 'post',
      endPoint: '/api/users',
      requestParams: { page: 1 },
      requestData: { name: 'test' },
    });
  });

  test('params와 data가 없으면 undefined로 전달한다', () => {
    const config = createAxiosRequestConfig({
      method: 'get',
      url: '/api/health',
    });

    logRequest(config);

    expect(printRequestLog).toHaveBeenCalledWith({
      method: 'get',
      endPoint: '/api/health',
      requestParams: undefined,
      requestData: undefined,
    });
  });
});
