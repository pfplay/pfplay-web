import { Authority } from '@/api/@types/@enums';
import { AvatarParts } from '@/api/@types/Avatar';

/* FIXME: 임시 타입. 아직 API 에서 Profile DTO 명확힌 안나옴 */
export interface UserProfile {
  nickName: string;
  introduction: string;
  avatarBody?: AvatarParts;
  avatarFace?: AvatarParts;
}

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
