import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { setCookie } from 'cookies-next';
import { usersService } from '@/shared/api/http/services';
import { APIError } from '@/shared/api/http/types/@shared';
import { OAuth2Provider } from '@/shared/api/http/types/oauth';
import { TokenExchangeResponse } from '@/shared/api/http/types/users';

export default function useExchangeToken() {
  return useMutation<
    TokenExchangeResponse,
    AxiosError<APIError>,
    { oauth2Provider: OAuth2Provider }
  >({
    mutationFn: async ({ oauth2Provider }) => {
      const result = await usersService.exchangeCodeForToken({
        oauth2Provider,
      });
      if (!result.success || !result.accessToken) {
        throw new Error(result.message || 'Access token not received');
      }
      const { accessToken } = result;
      // TODO: 쿠키에 토큰 담는 주체가 프론트인가...?
      setCookie('accessToken', accessToken, {
        httpOnly: true,
      });
      return result;
    },
  });
}
