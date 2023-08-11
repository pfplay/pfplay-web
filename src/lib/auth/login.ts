import { publicRequest } from './requester';

export interface Response {
  data: LoginResponse;
}

export interface LoginResponse {
  registered: boolean;
  authority: string;
  id: number;
  name: string;
}

export const login = async (accessToken?: string) =>
  publicRequest<Response>({
    // TODO: URL 확인 후 routes config로 교체
    url: 'v1/user/info',
    method: 'POST',
    data: {
      accessToken,
    },
  });
