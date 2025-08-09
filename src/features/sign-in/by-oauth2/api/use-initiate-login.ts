import { useMutation } from '@tanstack/react-query';
import { usersService } from '@/shared/api/http/services';
import { OAuth2Provider } from '@/shared/api/http/types/oauth';
import { generateRedirectUri } from '@/shared/lib/functions/pkce';

export function useInitiateLogin() {
  return useMutation({
    mutationFn: async (oauth2Provider: OAuth2Provider) => {
      try {
        const authStart = await usersService.initiateLogin({
          provider: oauth2Provider,
          code: '',
          codeVerifier: '',
        });
        if (!authStart.success) {
          throw new Error(authStart.message || 'Failed to start authentication');
        }
        const redirectUri = await generateRedirectUri(oauth2Provider);
        window.location.href = redirectUri;
      } catch (error) {
        console.error('Login initiation failed:', error);
        alert(`${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
  });
}
