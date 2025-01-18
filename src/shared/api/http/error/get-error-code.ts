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

  const errorCode = extractAPIErrorCode(err);
  if (!errorCode) {
    return;
  }

  if (!errorCodes.has(errorCode)) {
    log(`Unknown errorCode: ${errorCode}`);
    return;
  }

  return errorCode;
}

function isAPIError(err: unknown): err is AxiosError<APIError> {
  return isAxiosError(err) && !!extractAPIErrorCode(err);
}

function extractAPIErrorCode(err: AxiosError<any>): ErrorCode | undefined {
  return err.response?.data?.data?.errorCode ?? err.response?.data?.errorCode;
}
