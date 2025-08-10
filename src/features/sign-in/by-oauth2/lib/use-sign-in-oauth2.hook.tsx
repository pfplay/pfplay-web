import { useCallback } from 'react';
import { OAuth2Provider } from '@/shared/api/http/types/users';
import { useInitiateLogin } from '../api/use-initiate-login';

export default function useSignInOAuth2(oauth2Provider: OAuth2Provider) {
  const { mutate: initiateLogin } = useInitiateLogin();

  return useCallback(async () => {
    await initiateLogin(oauth2Provider);
  }, []);
}
