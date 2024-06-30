import { getErrorMessage } from '@/shared/api/get-error-message';
import { printErrorLog, printRequestLog, printResponseLog } from './network-log';

type AnyFunction = (...args: any[]) => any;

/**
 * 날것의 api를 호출할 때 로그를 찍기 위한 함수입니다.
 * 주의 - this binding이 필요한 경우 사용부에서 알아서 bind 해주어야 합니다.
 *
 * @example
 * ```ts
 * const fn = withLog(foo.fn, 'get');
 * const fn = withLog(fooUseThisArgs.fn.bind(fooUseThisArgs), 'get');
 * ```
 */
export default function withLog<T extends AnyFunction>(fn: T, method: string) {
  return async function (...args: Parameters<T>) {
    try {
      printRequestLog({
        method,
        endPoint: fn.name,
        requestData: args,
      });

      const response = await fn(...args);

      printResponseLog({
        method,
        endPoint: fn.name,
        response: response,
      });

      return response;
    } catch (error) {
      printErrorLog({
        method,
        endPoint: fn.name,
        errorMessage: getErrorMessage(error),
        error: error,
      });

      throw error;
    }
  } as T;
}
