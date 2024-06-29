import { ActivityType, AuthorityTier, ObtainmentType } from '@/shared/api/types/@enums';

export interface SignInRequest {
  oauth2Provider: 'google';
}

export interface SignInGuestRequest {
  userAgent: string;
}

export interface GetMyInfoResponse {
  uid: string;
  /**
   * guest의 경우 email이 비어서 옵니다.
   */
  email?: string;
  authorityTier: AuthorityTier;
  /**
   * @example "2024-06-23"
   */
  registrationDate: string;
  profileUpdated: boolean;
}

export interface ActivitySummary {
  activityType: ActivityType;
  score: number;
}

export interface GetMyProfileSummaryResponse {
  nickname: string;
  introduction: string;
  avatarBodyUri: string;
  avatarFaceUri: string;
  walletAddress: string;
  activitySummaries: ActivitySummary[];
}

export interface GetUserProfileSummaryRequest {
  uid: string;
  /**
   * TODO - API측 미구현 필드
   * @see https://pfplay.slack.com/archives/C03Q28EAU66/p1719138897610309?thread_ts=1719138389.602689&cid=C03Q28EAU66
   */
  // getOtherProfileSummaryRequest: {};
}

/**
 * TODO - 추측으로 작성됨. API측 구현 완료 시 명세 다시 확인 필요
 */
export interface GetUserProfileSummaryResponse {
  nickname: string;
  introduction: string;
  avatarBodyUri: string;
  avatarFaceUri: string;
  activitySummaries: ActivitySummary[];
}

export interface AvatarBody {
  id: number;
  name: string;
  resourceUri: string;
  obtainableType: ObtainmentType;
  obtainableScore: number;
  available: boolean;
  combinable: boolean;
  defaultSetting: boolean;
}

export interface AvatarFace {
  id: number;
  name: string;
  resourceUri: string;
}

export interface UpdateMyWalletRequest {
  walletAddress: string;
}

export interface UpdateMyBioRequest {
  nickname: string;
  introduction: string;
}

export interface UpdateMyAvatarFaceRequest {
  avatarFaceUri: string;
}

export interface UpdateMyAvatarBodyRequest {
  avatarBodyUri: string;
}

export interface UsersClient {
  /**
   * @deprecated 개발용 로그인
   */
  temporary_SignInFullMember: () => Promise<void>;
  /**
   * @deprecated 개발용 로그인
   */
  temporary_SignInAssociateMember: () => Promise<void>;
  /**
   * OAuth2 로그인
   */
  signIn: (request: SignInRequest) => void;
  /**
   * 게스트 로그인
   */
  signInGuest: (request: SignInGuestRequest) => Promise<void>;
  signOut: () => Promise<void>;
  getMyInfo: () => Promise<GetMyInfoResponse>;
  getMyProfileSummary: () => Promise<GetMyProfileSummaryResponse>;
  getUserProfileSummary: (
    request: GetUserProfileSummaryRequest
  ) => Promise<GetUserProfileSummaryResponse>;
  getMyAvatarBodies: () => Promise<AvatarBody[]>;
  getMyAvatarFaces: () => Promise<AvatarFace[]>;
  updateMyWallet: (request: UpdateMyWalletRequest) => Promise<void>;
  updateMyBio: (request: UpdateMyBioRequest) => Promise<void>;
  updateMyAvatarFace: (request: UpdateMyAvatarFaceRequest) => Promise<void>;
  updateMyAvatarBody: (request: UpdateMyAvatarBodyRequest) => Promise<void>;
}
