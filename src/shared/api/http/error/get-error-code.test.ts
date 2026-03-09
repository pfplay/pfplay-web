vi.mock('axios', () => ({
  isAxiosError: vi.fn(),
}));

vi.mock('@/shared/lib/functions/log/with-debugger', () => ({
  default: () => (fn: any) => fn,
}));

vi.mock('@/shared/lib/functions/log/logger', () => ({
  warnLog: vi.fn(),
}));

import { isAxiosError } from 'axios';
import { warnLog } from '@/shared/lib/functions/log/logger';
import { getErrorCode } from './get-error-code';
import { ErrorCode } from '../types/@shared';

beforeEach(() => {
  vi.clearAllMocks();
});

function createAxiosErrorWithCode(errorCode: string, nested = false) {
  const response = nested ? { data: { data: { errorCode } } } : { data: { errorCode } };

  return { response, isAxiosError: true };
}

describe('getErrorCode', () => {
  test('AxiosError + 유효한 ErrorCode → 해당 코드 반환', () => {
    const error = createAxiosErrorWithCode(ErrorCode.ACCESS_TOKEN_EXPIRED);
    (isAxiosError as Mock).mockReturnValue(true);

    expect(getErrorCode(error)).toBe(ErrorCode.ACCESS_TOKEN_EXPIRED);
  });

  test('AxiosError + 중첩 data.data.errorCode 구조 → 코드 추출', () => {
    const error = createAxiosErrorWithCode(ErrorCode.UNAUTHORIZED_SESSION, true);
    (isAxiosError as Mock).mockReturnValue(true);

    expect(getErrorCode(error)).toBe(ErrorCode.UNAUTHORIZED_SESSION);
  });

  test('AxiosError + 알 수 없는 errorCode → undefined 반환, warnLog 호출', () => {
    const error = createAxiosErrorWithCode('UNKNOWN-999');
    (isAxiosError as Mock).mockReturnValue(true);

    expect(getErrorCode(error)).toBeUndefined();
    expect(warnLog).toHaveBeenCalledWith('Unknown errorCode: UNKNOWN-999');
  });

  test('AxiosError + errorCode 없음 → undefined', () => {
    const error = { response: { data: {} }, isAxiosError: true };
    (isAxiosError as Mock).mockReturnValue(true);

    expect(getErrorCode(error)).toBeUndefined();
  });

  test('일반 Error → undefined', () => {
    (isAxiosError as Mock).mockReturnValue(false);

    const error = new Error('일반 에러');
    expect(getErrorCode(error)).toBeUndefined();
  });
});
