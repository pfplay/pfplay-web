import { isAxiosError } from 'axios';
import { ErrorCode } from '../types/@shared';

const errorCodes = new Set(Object.values(ErrorCode));

export function getErrorCode(err: unknown): ErrorCode | undefined {
  if (!isAxiosError(err)) return;

  const code = err.response?.data?.data?.code ?? err.response?.data?.code ?? err.code;

  if (!errorCodes.has(code)) return;

  return code;
}
