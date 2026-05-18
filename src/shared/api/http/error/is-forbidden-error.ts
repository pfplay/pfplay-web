import { isAxiosError } from 'axios';

export default function isForbiddenError(error: unknown) {
  return isAxiosError(error) && (error.status === 403 || error.response?.status === 403);
}
