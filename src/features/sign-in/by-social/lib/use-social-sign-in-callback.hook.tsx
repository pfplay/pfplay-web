'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { useFetchMeAsync } from '@/entities/me';
import * as Me from '@/entities/me/model/me.model';
import { OAuth2Provider } from '@/shared/api/http/types/users';
import {
  identifyAuthenticatedUser,
  trackSignedIn,
  trackSignedUp,
} from '@/shared/lib/analytics/auth-tracking';
import useCallbackLogin from '../api/use-callback-login';

export default function useOAuth2Callback() {
  const router = useRouter();
  const { mutateAsync: callbackLogin } = useCallbackLogin();
  const fetchMeAsync = useFetchMeAsync();

  return useCallback(
    async (oauth2Provider: OAuth2Provider) => {
      try {
        const tokenResponse = await callbackLogin(oauth2Provider);

        let me: Me.Model | null = null;
        try {
          me = await fetchMeAsync();
        } catch {
          /* /me lookup failed — fall through to default service entry */
        }

        if (me) {
          if (tokenResponse.isNewUser) {
            trackSignedUp(oauth2Provider);
          }
          trackSignedIn(me.authorityTier);
          identifyAuthenticatedUser({
            uid: me.uid,
            authorityTier: me.authorityTier,
            oauthProvider: oauth2Provider,
          });
        }

        router.push(Me.serviceEntry(me));
      } catch {
        router.push('/sign-in');
      }
    },
    [callbackLogin, fetchMeAsync, router]
  );
}
