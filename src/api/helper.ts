export const getErrorMessage = (err: unknown): string => {
  if (typeof err === 'string') {
    return err;
  }
  if (typeof err === 'object' && !!err && !Array.isArray(err)) {
    const error: Record<string, any> = err;
    const errorDataObj =
      /* TODO: API 에러 명세 확인하고 추가 대응 */ /* || */ error.response || error;

    const status = errorDataObj?.status;
    const message = errorDataObj?.message;

    if (message) {
      if (status === 500) {
        return `[SERVER ERROR] ${message}`;
      }
      return message;
    }
  }
  return 'Unknown error occurred';
};
