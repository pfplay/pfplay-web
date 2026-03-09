'use client';

import { useRouter } from 'next/navigation';
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
      try {
        await callbackLogin(oauth2Provider);
        const serviceEntry = await getMyServiceEntry();
        router.push(serviceEntry);
      } catch {
        router.push('/sign-in');
      }
    },
    [callbackLogin, getMyServiceEntry, router]
  );
}
