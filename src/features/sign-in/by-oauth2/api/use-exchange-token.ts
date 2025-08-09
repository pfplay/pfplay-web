import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { usersService } from '@/shared/api/http/services';
import { APIError } from '@/shared/api/http/types/@shared';
import { OAuth2Provider } from '@/shared/api/http/types/oauth';
import { TokenExchangeResponse } from '@/shared/api/http/types/users';
import {
  clearStoredCodeVerifier,
  getStoredCodeVerifier,
  parseCallbackParams,
} from '@/shared/lib/functions/pkce';

export default function useExchangeToken() {
  return useMutation<TokenExchangeResponse, AxiosError<APIError>, OAuth2Provider>({
    mutationFn: async (oauth2Provider) => {
      const params = parseCallbackParams();
      if (!params.code) {
        throw new Error(
          params.error_description || params.error || 'Authorization code not received'
        );
      }
      const { code } = params;

      try {
        const codeVerifier = getStoredCodeVerifier();
        if (!codeVerifier) {
          throw new Error('Code verifier not found in storage');
        }

        const request = {
          provider: oauth2Provider,
          code,
          codeVerifier,
        };
        const response = await usersService.exchangeToken(request);

        if (!response.success) {
          throw new Error(response.message || 'Token exchange failed');
        }
        if (response.success) {
          clearStoredCodeVerifier();
        }
        return response;
      } catch (error) {
        console.error('Token exchange failed:', error);
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    },
  });
}
