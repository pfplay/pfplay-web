import { ActivityType, AuthorityTier, AvatarCompositionType, ObtainmentType } from './@enums';

export interface SignInRequest {
  oauth2Provider: OAuth2Provider;
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
  introduction?: string;
  avatarCompositionType: AvatarCompositionType;
  avatarBodyUri: string;
  avatarFaceUri: string;
  avatarIconUri: string;
  combinePositionX?: number;
  combinePositionY?: number;
  walletAddress?: string;
  activitySummaries: ActivitySummary[];
  offsetX: number;
  offsetY: number;
  scale: number;
}
export interface InitiateLoginRequest {
  provider: OAuth2Provider;
  codeVerifier: string;
}

export type InitiateLoginResponse = {
  authUrl: string;
  state: string;
  provider: string;
  expiresIn: number;
};

export interface TokenExchangeRequest {
  provider: OAuth2Provider;
  code: string;
  codeVerifier: string;
  state: string;
}

export type TokenExchangeResponse = {
  tokenType: string;
  expiresIn: number;
  issuedAt: string;
};

export interface AuthCallbackParams {
  code?: string;
  state?: string;
  error?: string;
  error_description?: string;
}

export interface AvatarPartsDefaultMeta {
  id: number;
  name: string;
  resourceUri: string;
  available: boolean;
}

export interface AvatarBody extends AvatarPartsDefaultMeta {
  obtainableType: ObtainmentType;
  obtainableScore: number;
  combinePositionX?: number;
  combinePositionY?: number;
  combinable: boolean;
  defaultSetting: boolean;
}

export interface AvatarFace extends AvatarPartsDefaultMeta {}
export interface AvatarFacePos {
  offsetX: number; // 얼굴 너비 대비 비율 (0 ~ 1)
  offsetY: number; // 얼굴 높이 대비 비율 (0 ~ 1)
  scale: number; // 배율 (기준 1)
}

export interface UpdateMyWalletRequest {
  walletAddress: string;
}

export interface UpdateMyBioRequest {
  nickname: string;
  introduction?: string;
}

export type UpdateAvatarRequest =
  | {
      avatarCompositionType: 'SINGLE_BODY';
      body: {
        uri: string;
      };
    }
  | {
      avatarCompositionType: 'BODY_WITH_FACE';
      body: {
        uri: string;
      };
      face: {
        sourceType: 'INTERNAL_IMAGE' | 'NFT_URI';
        uri: string;
        transform: {
          offsetX: number;
          offsetY: number;
          scale: number;
        };
      };
    };
export interface UsersClient {
  /**
   * @deprecated 개발용 로그인
   */
  temporary_SignInFullCrew: () => Promise<void>;
  /**
   * @deprecated 개발용 로그인
   */
  temporary_SignInAssociateCrew: () => Promise<void>;
  /**
   * 게스트 로그인
   */
  signInGuest: () => Promise<void>;
  signOut: () => Promise<void>;
  getMyInfo: () => Promise<GetMyInfoResponse>;
  getMyProfileSummary: () => Promise<GetMyProfileSummaryResponse>;
  getMyAvatarBodies: () => Promise<AvatarBody[]>;
  getMyAvatarFaces: () => Promise<AvatarFace[]>;
  updateMyWallet: (request: UpdateMyWalletRequest) => Promise<void>;
  updateMyBio: (request: UpdateMyBioRequest) => Promise<void>;
  updateMyAvatar: (request: UpdateAvatarRequest) => Promise<void>;
}

export type OAuth2Provider = 'google' | 'twitter';
