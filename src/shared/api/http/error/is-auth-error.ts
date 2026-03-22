import { isAxiosError } from 'axios';

export default function isAuthError(error: unknown) {
  return isAxiosError(error) && (error.status === 401 || error.response?.status === 401);
}
