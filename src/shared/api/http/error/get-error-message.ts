import { isAxiosError } from 'axios';
import type { Dictionary } from '@/shared/lib/localization/i18n.context';
import { ErrorCode } from '../types/@shared';

export function getErrorMessage(err: unknown, t?: Dictionary): string {
  if (typeof err === 'string') {
    return err;
  }

  if (isAxiosError(err)) {
    if (t) {
      const errorCode = err.response?.data?.errorCode;
      const friendlyMessage = tryConvertErrorCodeToFriendlyMessage(errorCode, t);

      if (friendlyMessage) {
        return friendlyMessage;
      }
    }

    return err.response?.data?.message ?? err.message;
  }

  if (err instanceof Error) {
    return err.message;
  }
  return 'Unknown error occurred';
}

/**
 * 임시 코드. 좀 더 확실한 전역 에러 핸들링 기법 필요
 */
function tryConvertErrorCodeToFriendlyMessage(
  errorCode: ErrorCode,
  t: Dictionary
): string | undefined {
  const friendlyMessages: Partial<Record<ErrorCode, string>> = {
    [ErrorCode.NOT_FOUND_ROOM]: t.partyroom.ec.shut_down,
    [ErrorCode.ALREADY_TERMINATED]: t.partyroom.ec.shut_down,
  };

  return friendlyMessages[errorCode];
}
