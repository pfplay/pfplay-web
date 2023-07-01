import { publicRequest } from './requester';

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export const login = async (email: string) =>
  publicRequest<LoginResponse>({
    // TODO: Check the endpoint and replace with routes config
    url: '/auth/login',
    method: 'POST',
    data: {
      email,
    },
  });
