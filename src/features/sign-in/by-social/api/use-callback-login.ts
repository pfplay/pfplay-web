import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { usersService } from '@/shared/api/http/services';
import { APIError } from '@/shared/api/http/types/@shared';
import { OAuth2Provider, TokenExchangeResponse } from '@/shared/api/http/types/users';
import {
  clearStoredCodeVerifier,
  clearStoredState,
  getStoredCodeVerifier,
  getStoredState,
  parseCallbackParams,
} from '@/shared/lib/functions/pkce';

export default function useCallbackLogin() {
  return useMutation<TokenExchangeResponse, AxiosError<APIError>, OAuth2Provider>({
    mutationFn: async (oauth2Provider) => {
      try {
        const params = parseCallbackParams();
        if (!params.code) {
          throw new Error(
            params.error_description || params.error || 'Authorization code not received'
          );
        }
        const { code } = params;
        const codeVerifier = getStoredCodeVerifier();
        const state = getStoredState();
        if (!codeVerifier) {
          throw new Error('Code verifier not found in storage');
        }
        if (!state) {
          throw new Error('State not found in storage');
        }
        const request = {
          provider: oauth2Provider,
          code,
          codeVerifier,
          state,
        };
        const response = await usersService.exchangeToken(request);
        if (!response.success) {
          throw new Error(response.message || 'Token exchange failed');
        }
        if (response.success) {
          clearStoredCodeVerifier();
          clearStoredState();
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
