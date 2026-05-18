vi.mock('axios', () => ({
  isAxiosError: vi.fn(),
}));

import { isAxiosError } from 'axios';
import isForbiddenError from './is-forbidden-error';

beforeEach(() => {
  vi.clearAllMocks();
});

function createAxiosError(overrides: { status?: number; responseStatus?: number }) {
  return {
    status: overrides.status,
    response: overrides.responseStatus != null ? { status: overrides.responseStatus } : undefined,
    isAxiosError: true,
  };
}

describe('isForbiddenError', () => {
  test('AxiosError + status 403 → true', () => {
    const error = createAxiosError({ status: 403 });
    (isAxiosError as Mock).mockReturnValue(true);

    expect(isForbiddenError(error)).toBe(true);
  });

  test('AxiosError + response.status 403 → true', () => {
    const error = createAxiosError({ responseStatus: 403 });
    (isAxiosError as Mock).mockReturnValue(true);

    expect(isForbiddenError(error)).toBe(true);
  });

  test('AxiosError + status 401 → false', () => {
    const error = createAxiosError({ status: 401, responseStatus: 401 });
    (isAxiosError as Mock).mockReturnValue(true);

    expect(isForbiddenError(error)).toBe(false);
  });

  test('AxiosError + status 500 → false', () => {
    const error = createAxiosError({ status: 500, responseStatus: 500 });
    (isAxiosError as Mock).mockReturnValue(true);

    expect(isForbiddenError(error)).toBe(false);
  });

  test('일반 Error → false', () => {
    (isAxiosError as Mock).mockReturnValue(false);

    const error = new Error('일반 에러');
    expect(isForbiddenError(error)).toBe(false);
  });

  test('undefined → false', () => {
    (isAxiosError as Mock).mockReturnValue(false);

    expect(isForbiddenError(undefined)).toBe(false);
  });
});
