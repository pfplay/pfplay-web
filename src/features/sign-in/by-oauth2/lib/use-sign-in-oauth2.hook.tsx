import { useCallback } from 'react';
import { OAuth2Provider } from '@/shared/api/http/types/oauth';
import useExchangeToken from '../api/use-exchange-token';
import { useInitiateLogin } from '../api/use-initiate-login';

export default function useSignInOAuth2(oauth2Provider: OAuth2Provider) {
  const { mutate: initiateLogin } = useInitiateLogin();
  const { mutate: exchangeToken } = useExchangeToken();

  return useCallback(async () => {
    await initiateLogin(oauth2Provider);
    await exchangeToken(oauth2Provider);
  }, [initiateLogin, exchangeToken, oauth2Provider]);
}
