import { Authority } from '@/api/@types/@enums';
import { AvatarBody, AvatarFace } from '@/api/@types/Avatar';

/* FIXME: 임시 타입. 아직 API 에서 Profile DTO 안나옴 */
export interface UserProfile {
  nickName?: string;
  introduction?: string;
  avatarBody?: AvatarBody;
  avatarFace?: AvatarFace;
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
