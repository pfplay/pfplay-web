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
import useCallbackLogin from '../api/use-callback-login';

export default function useOAuth2Callback() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { mutateAsync: callbackLogin } = useCallbackLogin();
  const fetchMeAsync = useFetchMeAsync();

  return useCallback(
    async (oauth2Provider: OAuth2Provider) => {
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
          trackSignedIn(me.authorityTier);
        }

        // 옵션2(#7): 신규 가입자는 좀비 me 와 무관하게 프로필 설정 강제.
        router.push(Me.serviceEntry(me, tokenResponse.isNewUser));
      } catch {
        router.push('/sign-in');
      }
    },
    [callbackLogin, fetchMeAsync, queryClient, router]
  );
}
