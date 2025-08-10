import { isAxiosError } from 'axios';

export default function isAuthError(error: unknown) {
  // TODO: OAuth 콜백 경로에서는 401 에러 처리를 스킵 (여기서 처리가 최선인가...)
  if (typeof window !== 'undefined' && window.location.pathname.includes('/auth/callback/')) {
    return false;
  }
  return isAxiosError(error) && (error.status === 401 || error.response?.status === 401);
}
