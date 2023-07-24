import { routes } from '@/config/routes';

export function isInstanceOfAPIError(object: unknown): object is ApiError {
  return object instanceof ApiError && ('redirectUrl' in object || 'notFound' in object);
}

export class ApiError extends Error {
  public redirectUrl = '';

  public notFound = false;
}

export class NotFoundError extends ApiError {
  public name = 'NotFoundError';

  public message = '찾을 수 없습니다.';

  public notFound = true;
}

export class ForbiddenError extends ApiError {
  public name = 'ForbiddenError';

  public message = '인증처리에 실패했습니다.';

  public redirectUrl = routes.error;
}

export class AuthError extends ApiError {
  public name = 'AuthError';

  public message = '인증되지 않은 사용자입니다.';

  public redirectUrl = routes.auth.base;
}
