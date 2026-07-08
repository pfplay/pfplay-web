// returnTo 는 location.pathname(쿼리 제외)만 받는다 → ?source=link 등 휘발성 쿼리 자연 배제.
export function buildReauthUrl(roomPathname: string): string {
  return `/sign-in?returnTo=${encodeURIComponent(roomPathname)}`;
}

/**
 * 만료-회원을 재인증으로 보낸다. 향후 refresh 토큰 도입 시 이 함수 맨 앞에
 * "조용히 refresh 시도 → 성공 시 무중단 지속 / 실패 시 아래 이동"을 삽입하는
 * 단일 지점이다. (#428, platform#306)
 */
export function reauthenticate(roomPathname: string): void {
  if (typeof window === 'undefined') return;
  window.location.href = buildReauthUrl(roomPathname);
}
