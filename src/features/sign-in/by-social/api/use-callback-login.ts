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
    mutationKey: ['oauth2-callback'],
    mutationFn: async (oauth2Provider) => {
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
      clearStoredCodeVerifier();
      clearStoredState();
      return response;
    },
  });
}
