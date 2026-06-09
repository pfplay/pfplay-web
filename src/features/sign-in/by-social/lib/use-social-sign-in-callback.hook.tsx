'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useFetchMeAsync } from '@/entities/me';
import * as Me from '@/entities/me/model/me.model';
import { QueryKeys } from '@/shared/api/http/query-keys';
import { OAuth2Provider } from '@/shared/api/http/types/users';
import {
  identifyAuthenticatedUser,
  trackSignedIn,
  trackSignedUp,
} from '@/shared/lib/analytics/auth-tracking';
import { getStoredCodeVerifier } from '@/shared/lib/functions/pkce';
import useCallbackLogin from '../api/use-callback-login';

export default function useOAuth2Callback() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { mutateAsync: callbackLogin } = useCallbackLogin();
  const fetchMeAsync = useFetchMeAsync();

  return useCallback(
    async (oauth2Provider: OAuth2Provider) => {
      // #347: 콜백 URL 재진입(뒤로가기/새로고침) 방어. PKCE codeVerifier 는 최초 교환 성공 시
      // 삭제되므로, 부재 = 이미 교환됨(재진입) 또는 무효 접근. 재교환은 1회용이라 throw →
      // 전역 MutationCache.onError 가 "Code verifier not found" 모달을 띄운다. 교환을 시도하지
      // 않고 조용히 sign-in 으로 보낸다(인증된 사용자면 sign-in 이 다시 /parties 로 바운스).
      if (!getStoredCodeVerifier()) {
        router.replace('/sign-in');
        return;
      }
      try {
        const tokenResponse = await callbackLogin(oauth2Provider);

        // 옵션1(#7): root layout 의 <SystemAnnouncementSubscriber/> 가 callback
        // 보다 먼저 발사한 GUEST-cookie in-flight me query 를 abort + stale 제거.
        // cancelQueries 가 필수 — removeQueries 만으로는 in-flight 가 살아남아
        // 좀비 me 가 캐시에 다시 박힌다. 그 후 fetchMeAsync 는 새 cookie 로 재호출.
        await queryClient.cancelQueries({ queryKey: [QueryKeys.Me] });
        queryClient.removeQueries({ queryKey: [QueryKeys.Me] });

        let me: Me.Model | null = null;
        try {
          me = await fetchMeAsync();
        } catch {
          /* /me lookup failed — fall through to default service entry */
        }

        if (me) {
          // identify(→setUserId)를 먼저 수행한 뒤 track 발사 — track 이 setUserId 전이면
          // 직전 식별자(게스트/익명)로 귀속되므로 순서 보장 필요.
          identifyAuthenticatedUser({
            uid: me.uid,
            authorityTier: me.authorityTier,
            oauthProvider: oauth2Provider,
          });
          if (tokenResponse.isNewUser) {
            trackSignedUp(oauth2Provider);
          }
          // 콜백 도달 = OAuth 인증 완료. me 가 좀비 GUEST 로 늦게 풀려도 SIGNED_IN auth_type 은 member 로 고정.
          trackSignedIn(me.authorityTier, 'member');
        }

        // 옵션2(#7): 신규 가입자는 좀비 me 와 무관하게 프로필 설정 강제.
        // #347: redirect-only 콜백 페이지라 replace — push 면 콜백 URL 이 히스토리에 남아
        // 뒤로가기로 재진입 → 1회용 PKCE 재교환 throw → 에러 모달.
        router.replace(Me.serviceEntry(me, tokenResponse.isNewUser));
      } catch {
        router.replace('/sign-in');
      }
    },
    [callbackLogin, fetchMeAsync, queryClient, router]
  );
}
