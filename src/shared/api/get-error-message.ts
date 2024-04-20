import { isAxiosError } from 'axios';

export const getErrorMessage = (err: unknown): string => {
  if (typeof err === 'string') {
    return err;
  }
  if (isAxiosError(err)) {
    return err.response?.data?.message ?? err.message;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return 'Unknown error occurred';
};
