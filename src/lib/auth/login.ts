import { publicRequest } from './requester';

export interface LoginResponse {
  data: {
    registered: boolean;
    authority: string;
    id: number;
    name: string;
  };
}

export const login = async (accessToken?: string) =>
  publicRequest<LoginResponse>({
    // TODO: URL 확인 후 routes config로 교체
    url: 'v1/user/info',
    method: 'POST',
    data: {
      accessToken: accessToken,
    },
  });
