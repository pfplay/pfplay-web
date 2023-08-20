import { Authority } from '@/api/@types/@enums';

export interface UserLoginRequest {
  accessToken: string;
}

export interface UserLoginResponse {
  id: number;
  name: string;
  registered: boolean;
  authority: Authority;
  accessToken: string;
}

export interface UserClient {
  login(request: UserLoginRequest): Promise<UserLoginResponse>;
}
