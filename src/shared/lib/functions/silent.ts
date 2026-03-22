export type SilentOptions<Result, Error = any> = {
  onSuccess?: (data: Result) => void;
  onError?: (error: Error) => void;
  onSettled?: () => void;
};
type IsSuccess = boolean;

/**
 * 선언적으로 promise를 처리하기 위한 유틸
 */
export default async function silent<Result, Error = any>(
  promise: PromiseLike<Result>,
  options: SilentOptions<Result, Error> = {}
): Promise<IsSuccess> {
  try {
    const result = await promise;
    options.onSuccess?.(result);

    return true;
  } catch (error) {
    options.onError?.(error as Error);

    return false;
  } finally {
    options.onSettled?.();
  }
}
