import { Authority } from '@/api/@types/@enums';

export interface User {
  userId: number;
  email: string;
  name: string;
  accessToken: string;
  isRegistered: boolean;
  authority: Authority;
}

export interface AuthLoginRequest {
  // TODO: API 분들께 질문할 것: camelCase 안되는지?
  access_token: string;
}

export interface AuthLoginResponse {
  // TODO: 유진님께 질문할 것: 응답이 이거밖에 안되는게 맞는지?
  registered: boolean;
  authority: Authority;
}

export interface AuthClient {
  login(request: AuthLoginRequest): Promise<AuthLoginResponse>;
}
