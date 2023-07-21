import { publicRequest } from './requester';

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export const login = async (email: string) =>
  publicRequest<LoginResponse>({
    // TODO: URL 확인 후 routes config로 교체
    url: '/auth/login',
    method: 'POST',
    data: {
      email,
    },
  });
