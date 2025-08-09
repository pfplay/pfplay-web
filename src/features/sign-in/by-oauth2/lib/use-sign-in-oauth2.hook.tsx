import { useCallback } from 'react';
import { usersService } from '@/shared/api/http/services';
import { OAuth2Provider } from '@/shared/api/http/types/oauth';

export default function useSignInOAuth2(oauth2Provider: OAuth2Provider) {
  return useCallback(() => {
    usersService.initiateLogin({
      oauth2Provider,
    });
  }, []);
}
