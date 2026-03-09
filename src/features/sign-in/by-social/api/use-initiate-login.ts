import { useMutation } from '@tanstack/react-query';
import { usersService } from '@/shared/api/http/services';
import { OAuth2Provider } from '@/shared/api/http/types/users';
import { createPKCEParams, setStoredState } from '@/shared/lib/functions/pkce';

export function useInitiateLogin() {
  return useMutation({
    mutationFn: async (oauth2Provider: OAuth2Provider) => {
      try {
        const { codeVerifier } = await createPKCEParams();
        const response = await usersService.initiateLogin({
          provider: oauth2Provider,
          codeVerifier,
        });
        setStoredState(response.state);
        if (!response.authUrl) {
          throw new Error('Failed to get authentication URL');
        }
        window.location.href = response.authUrl;
      } catch (error) {
        console.error('Login initiation failed:', error);
        alert(`${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
  });
}
