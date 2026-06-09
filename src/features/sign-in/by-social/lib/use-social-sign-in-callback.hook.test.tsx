import { renderWithClient } from '@/shared/api/__test__/test-utils';
import { QueryKeys } from '@/shared/api/http/query-keys';
import { AuthorityTier } from '@/shared/api/http/types/@enums';
import useOAuth2Callback from './use-social-sign-in-callback.hook';

const replace = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
}));

const getStoredCodeVerifier = vi.fn();
vi.mock('@/shared/lib/functions/pkce', () => ({
  getStoredCodeVerifier: () => getStoredCodeVerifier(),
}));

const callbackLogin = vi.fn();
vi.mock('../api/use-callback-login', () => ({
  __esModule: true,
  default: () => ({ mutateAsync: callbackLogin }),
}));

const fetchMeAsync = vi.fn();
vi.mock('@/entities/me', () => ({
  useFetchMeAsync: () => fetchMeAsync,
}));

const identifyAuthenticatedUser = vi.fn();
const trackSignedUp = vi.fn();
const trackSignedIn = vi.fn();
vi.mock('@/shared/lib/analytics/auth-tracking', () => ({
  identifyAuthenticatedUser: (...a: unknown[]) => identifyAuthenticatedUser(...a),
  trackSignedUp: (...a: unknown[]) => trackSignedUp(...a),
  trackSignedIn: (...a: unknown[]) => trackSignedIn(...a),
}));

function meModel(overrides: Record<string, unknown> = {}) {
  return {
    uid: 'member-uid',
    authorityTier: AuthorityTier.FM,
    profileUpdated: true,
    nickname: 'n',
    ...overrides,
  } as never;
}

describe('useOAuth2Callback (D/#7+#9 Phase1)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // 기본: 정상 콜백 진입(codeVerifier 존재). 재진입 테스트만 부재로 override.
    getStoredCodeVerifier.mockReturnValue('verifier-present');
  });

  test('옵션2: isNewUser=true 면 profileUpdated=true(좀비 me) 여도 /settings/profile 강제', async () => {
    callbackLogin.mockResolvedValue({ isNewUser: true });
    fetchMeAsync.mockResolvedValue(meModel({ profileUpdated: true }));

    const { result } = renderWithClient(() => useOAuth2Callback());
    await result.current('google');

    expect(replace).toHaveBeenCalledWith('/settings/profile');
  });

  test('isNewUser=false + profileUpdated=true → /parties (기존 회귀)', async () => {
    callbackLogin.mockResolvedValue({ isNewUser: false });
    fetchMeAsync.mockResolvedValue(meModel({ profileUpdated: true }));

    const { result } = renderWithClient(() => useOAuth2Callback());
    await result.current('google');

    expect(replace).toHaveBeenCalledWith('/parties');
  });

  test('옵션1: callback 후 [Me] 캐시 cancel+remove 를 fetchMeAsync 이전에 수행', async () => {
    callbackLogin.mockResolvedValue({ isNewUser: false });
    fetchMeAsync.mockResolvedValue(meModel());

    const { result, queryClient } = renderWithClient(() => useOAuth2Callback());
    const cancelSpy = vi.spyOn(queryClient, 'cancelQueries');
    const removeSpy = vi.spyOn(queryClient, 'removeQueries');

    await result.current('google');

    expect(cancelSpy).toHaveBeenCalledWith({ queryKey: [QueryKeys.Me] });
    expect(removeSpy).toHaveBeenCalledWith({ queryKey: [QueryKeys.Me] });
    expect(cancelSpy.mock.invocationCallOrder[0]).toBeLessThan(
      fetchMeAsync.mock.invocationCallOrder[0]
    );
  });

  test('#9: identify(setUserId) 가 trackSignedUp/In 보다 먼저 발사', async () => {
    callbackLogin.mockResolvedValue({ isNewUser: true });
    fetchMeAsync.mockResolvedValue(meModel({ authorityTier: AuthorityTier.FM }));

    const { result } = renderWithClient(() => useOAuth2Callback());
    await result.current('google');

    expect(identifyAuthenticatedUser).toHaveBeenCalledTimes(1);
    expect(trackSignedUp).toHaveBeenCalledWith('google');
    expect(trackSignedIn).toHaveBeenCalledTimes(1);
    expect(identifyAuthenticatedUser.mock.invocationCallOrder[0]).toBeLessThan(
      trackSignedUp.mock.invocationCallOrder[0]
    );
    expect(identifyAuthenticatedUser.mock.invocationCallOrder[0]).toBeLessThan(
      trackSignedIn.mock.invocationCallOrder[0]
    );
  });

  test('isNewUser=false 면 trackSignedUp 미발사, trackSignedIn 은 발사', async () => {
    callbackLogin.mockResolvedValue({ isNewUser: false });
    fetchMeAsync.mockResolvedValue(meModel());

    const { result } = renderWithClient(() => useOAuth2Callback());
    await result.current('google');

    expect(trackSignedUp).not.toHaveBeenCalled();
    expect(trackSignedIn).toHaveBeenCalledTimes(1);
  });

  test("B′: 정상 member-me 면 trackSignedIn 이 'member' override 와 함께 발사", async () => {
    callbackLogin.mockResolvedValue({ isNewUser: false });
    fetchMeAsync.mockResolvedValue(meModel({ authorityTier: AuthorityTier.FM }));

    const { result } = renderWithClient(() => useOAuth2Callback());
    await result.current('google');

    expect(trackSignedIn).toHaveBeenCalledWith(AuthorityTier.FM, 'member');
  });

  test("B′: 좀비(GUEST-ish) me(GT) 가 와도 SIGNED_IN auth_type 은 'member' 로 고정", async () => {
    callbackLogin.mockResolvedValue({ isNewUser: false });
    fetchMeAsync.mockResolvedValue(meModel({ authorityTier: AuthorityTier.GT }));

    const { result } = renderWithClient(() => useOAuth2Callback());
    await result.current('google');

    // tier 가 GT(guest-ish 좀비) 여도 콜백은 member 권위로 SIGNED_IN 을 고정한다.
    expect(trackSignedIn).toHaveBeenCalledWith(AuthorityTier.GT, 'member');
  });

  test('callbackLogin 실패 시 /sign-in 으로', async () => {
    callbackLogin.mockRejectedValue(new Error('exchange failed'));

    const { result } = renderWithClient(() => useOAuth2Callback());
    await result.current('google');

    expect(replace).toHaveBeenCalledWith('/sign-in');
  });

  test('#347 재진입(codeVerifier 부재): callbackLogin 미호출 + replace(/sign-in)', async () => {
    // 콜백 URL 재진입(뒤로가기/새로고침)은 이미 1회용 PKCE 교환이 끝나 codeVerifier 가
    // 삭제된 상태. 재교환을 시도하면 throw → 전역 MutationCache.onError 가 모달을 띄운다.
    // 교환 전 codeVerifier 부재를 감지해 조용히 sign-in 으로 보낸다(모달 없음).
    getStoredCodeVerifier.mockReturnValue(undefined);

    const { result } = renderWithClient(() => useOAuth2Callback());
    await result.current('google');

    expect(callbackLogin).not.toHaveBeenCalled();
    expect(replace).toHaveBeenCalledWith('/sign-in');
  });
});
