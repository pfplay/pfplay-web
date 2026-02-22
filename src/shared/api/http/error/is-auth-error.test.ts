jest.mock('axios', () => ({
  isAxiosError: jest.fn(),
}));

import { isAxiosError } from 'axios';
import isAuthError from './is-auth-error';

beforeEach(() => {
  jest.clearAllMocks();
});

function createAxiosError(overrides: { status?: number; responseStatus?: number }) {
  return {
    status: overrides.status,
    response: overrides.responseStatus != null ? { status: overrides.responseStatus } : undefined,
    isAxiosError: true,
  };
}

describe('isAuthError', () => {
  test('AxiosError + status 401 → true', () => {
    const error = createAxiosError({ status: 401 });
    (isAxiosError as jest.Mock).mockReturnValue(true);

    expect(isAuthError(error)).toBe(true);
  });

  test('AxiosError + response.status 401 → true', () => {
    const error = createAxiosError({ responseStatus: 401 });
    (isAxiosError as jest.Mock).mockReturnValue(true);

    expect(isAuthError(error)).toBe(true);
  });

  test('AxiosError + status 403 → false', () => {
    const error = createAxiosError({ status: 403, responseStatus: 403 });
    (isAxiosError as jest.Mock).mockReturnValue(true);

    expect(isAuthError(error)).toBe(false);
  });

  test('일반 Error → false', () => {
    (isAxiosError as jest.Mock).mockReturnValue(false);

    const error = new Error('일반 에러');
    expect(isAuthError(error)).toBe(false);
  });
});
