import { useCallback } from 'react';
import { UsersService } from '@/shared/api/services/users';
import { Oauth2Provider } from '@/shared/api/types/users';

export default function useSignIn() {
  return useCallback(() => {
    UsersService.signIn({
      oauth2Provider: Oauth2Provider.Google,
      redirectLocation: 'oauth-redirect',
    });
  }, []);
}
