import {
  PUBLIC_ROUTE_PREFIXES,
  GUEST_AUTO_LOGIN_ROUTE_PATTERN,
} from '@/entities/me/model/constants';
import { getErrorMessage } from '@/shared/api/http/error/get-error-message';
import isAuthError from '@/shared/api/http/error/is-auth-error';
import { shouldSkipGlobalErrorHandling } from '@/shared/lib/decorators/skip-global-error-handling';
import { Dialog } from '@/shared/ui/components/dialog';
import { Typography } from '@/shared/ui/components/typography';

/**
 * 전역 버블드 에러 핸들러 (web#303 B②).
 * 인증 에러(401) 확정 시 `/` 로 하드 리다이렉트하되,
 * `PUBLIC_ROUTE_PREFIXES`(`/auth/callback`, `/docs`, `/sign-in`) 또는
 * `GUEST_AUTO_LOGIN_ROUTE_PATTERN`(`/parties/<id>`) 경로와 `/`·`/link/*` 카브아웃에서는
 * 리다이렉트를 억제한다 — pre-auth 401이 진행 중인 로그인 POST를 중단시키는 #303 근본 원인 방지.
 */
export function handleBubbledError(error: unknown) {
  if (shouldSkipGlobalErrorHandling(error)) {
    return;
  }

  const errorMessage = getErrorMessage(error);

  if (typeof window === 'undefined') {
    console.error(`[ERROR] ${errorMessage}`);
    return;
  }

  if (isAuthError(error)) {
    const { pathname } = window.location;
    const isPublicOrGuestAutoLogin =
      PUBLIC_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ||
      GUEST_AUTO_LOGIN_ROUTE_PATTERN.test(pathname);

    if (!isPublicOrGuestAutoLogin && pathname !== '/' && !pathname.startsWith('/link/')) {
      window.location.href = '/';
    }
    return;
  }

  console.error(error);

  const { destroy } = Dialog.open({
    title: 'Error',
    Body: () => (
      <>
        <Typography type='caption1' className='text-gray-50'>
          {errorMessage}
        </Typography>

        <Dialog.ButtonGroup>
          <Dialog.Button onClick={() => destroy()}>Close</Dialog.Button>
        </Dialog.ButtonGroup>
      </>
    ),
    onClose: () => destroy(),
  });
}
