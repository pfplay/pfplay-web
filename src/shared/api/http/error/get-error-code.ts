import { AxiosError, isAxiosError } from 'axios';
import { warnLog } from '@/shared/lib/functions/log/logger';
import withDebugger from '@/shared/lib/functions/log/with-debugger';
import { APIError, ErrorCode } from '../types/@shared';

const logger = withDebugger(0);
const log = logger(warnLog);

const errorCodes = new Set(Object.values(ErrorCode));

export function getErrorCode(err: unknown): ErrorCode | undefined {
  if (!isAPIError(err)) {
    return;
  }

  const code = err.response?.data.errorCode;
  if (!code) {
    return;
  }

  if (!errorCodes.has(code)) {
    log(`Unknown error code: ${code}`);
    return;
  }

  return code;
}

function isAPIError(err: unknown): err is AxiosError<APIError> {
  return isAxiosError(err) && 'errorCode' in err.response?.data; // unwrap(data.data >> data) 되었다고 가정
}
