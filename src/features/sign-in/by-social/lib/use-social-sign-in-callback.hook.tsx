'use client';

import { useRouter } from 'next/navigation'; // next/router 대신 next/navigation 사용
import { useCallback } from 'react';
import { useGetMyServiceEntry } from '@/entities/me';
import { OAuth2Provider } from '@/shared/api/http/types/users';
import useCallbackLogin from '../api/use-callback-login';

export default function useOAuth2Callback() {
  const router = useRouter();
  const { mutateAsync: callbackLogin } = useCallbackLogin();
  const getMyServiceEntry = useGetMyServiceEntry();

  return useCallback(
    async (oauth2Provider: OAuth2Provider) => {
      const response = await callbackLogin(oauth2Provider);
      if (response.success) {
        const serviceEntry = await getMyServiceEntry();
        router.push(serviceEntry);
      } else {
        router.push('/sign-in');
      }
    },
    [callbackLogin, getMyServiceEntry, router]
  );
}
