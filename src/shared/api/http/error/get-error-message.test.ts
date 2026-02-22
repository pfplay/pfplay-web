jest.mock('axios', () => ({
  isAxiosError: jest.fn(),
}));

import { isAxiosError } from 'axios';
import { getErrorMessage } from './get-error-message';

beforeEach(() => {
  jest.clearAllMocks();
});

function createAxiosError(overrides: { message?: string; responseData?: Record<string, unknown> }) {
  return {
    message: overrides.message ?? 'Request failed',
    response: overrides.responseData ? { data: overrides.responseData } : undefined,
    isAxiosError: true,
  };
}

describe('getErrorMessage', () => {
  test('string 입력 → 그대로 반환', () => {
    (isAxiosError as jest.Mock).mockReturnValue(false);

    expect(getErrorMessage('서버 오류')).toBe('서버 오류');
  });

  test('AxiosError + response.data.message 있음 → data.message 반환', () => {
    const error = createAxiosError({
      message: 'Request failed',
      responseData: { message: '인증이 만료되었습니다' },
    });
    (isAxiosError as jest.Mock).mockReturnValue(true);

    expect(getErrorMessage(error)).toBe('인증이 만료되었습니다');
  });

  test('AxiosError + response.data.message 없음 → err.message 반환', () => {
    const error = createAxiosError({
      message: 'Network Error',
      responseData: {},
    });
    (isAxiosError as jest.Mock).mockReturnValue(true);

    expect(getErrorMessage(error)).toBe('Network Error');
  });

  test('Error 인스턴스 → err.message 반환', () => {
    (isAxiosError as jest.Mock).mockReturnValue(false);

    const error = new Error('일반 에러');
    expect(getErrorMessage(error)).toBe('일반 에러');
  });

  test('unknown 타입 → "Unknown error occurred" 반환', () => {
    (isAxiosError as jest.Mock).mockReturnValue(false);

    expect(getErrorMessage(12345)).toBe('Unknown error occurred');
    expect(getErrorMessage(null)).toBe('Unknown error occurred');
    expect(getErrorMessage(undefined)).toBe('Unknown error occurred');
  });
});
