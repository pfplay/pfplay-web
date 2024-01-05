import { Authority } from '@/api/@types/@enums';

export interface UserProfile {
  nickname: string;
  introduction: string;
  faceUrl?: string;
  bodyId?: number;
  walletAddress?: string;
}

export interface UserPermission {
  settingProfile: boolean;
  showPartyListDisplay: boolean;
  enterMainStage: boolean;
  chat: boolean;
  createPlayList: boolean;
  createWaitDj: boolean;
  enterPartyRoom: boolean;
  createPartyRoom: boolean;
  admin: boolean;
  communityManager: boolean;
  moderator: boolean;
  clubber: boolean;
  listener: boolean;
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
  userPermission: UserPermission;
}

export interface ProfileResponse {
  nickname: string;
  introduction: string;
  faceUrl: string;
  bodyId: number;
  bodyUrl: string;
  walletAddress: string;
}

export interface UserClient {
  login(request: UserLoginRequest): Promise<UserLoginResponse>;
  getProfile(): Promise<ProfileResponse>;
  updateProfile(request: UserProfile): Promise<UserProfile>;
  getProfileRegisteredStatus(): Promise<{ authorized: boolean; hasProfile: boolean }>;
}
