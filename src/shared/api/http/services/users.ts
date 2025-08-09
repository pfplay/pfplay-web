import { authConfig } from '@/shared/config/oauth';
import { Singleton } from '@/shared/lib/decorators/singleton';
import HTTPClient from '../client/client';
import type {
  GetMyInfoResponse,
  GetMyProfileSummaryResponse,
  GetUserProfileSummaryRequest,
  GetUserProfileSummaryResponse,
  AvatarBody,
  AvatarFace,
  UpdateMyWalletRequest,
  UpdateMyBioRequest,
  UpdateMyAvatarFaceRequest,
  UpdateMyAvatarBodyRequest,
  UsersClient,
  AuthStartResponse,
  TokenExchangeResponse,
  TokenExchangeRequest,
} from '../types/users';

@Singleton
export default class UsersService extends HTTPClient implements UsersClient {
  private ROUTE_V1 = 'v1/users';

  public initiateLogin(request: TokenExchangeRequest) {
    return this.post<AuthStartResponse>(
      `${this.ROUTE_V1}${authConfig.backend.authStartPath}`,
      request
    );
  }

  public exchangeToken(request: TokenExchangeRequest) {
    return this.post<TokenExchangeResponse>(
      `${this.ROUTE_V1}${authConfig.backend.tokenExchangePath}`,
      request
    );
  }

  public signInGuest() {
    return this.post<void>(`${this.ROUTE_V1}/guests/sign`);
  }

  public signOut() {
    return this.post<void>(`${this.ROUTE_V1}/logout`);
  }

  public temporary_SignInFullCrew() {
    return this.post<void>(`${this.ROUTE_V1}/members/sign/temporary/full-member`);
  }

  public temporary_SignInAssociateCrew() {
    return this.post<void>(`${this.ROUTE_V1}/members/sign/temporary/associate-member`);
  }

  public getMyInfo() {
    return this.get<GetMyInfoResponse>(`${this.ROUTE_V1}/me/info`);
  }

  public getUserProfileSummary(request: GetUserProfileSummaryRequest) {
    return this.get<GetUserProfileSummaryResponse>(
      `${this.ROUTE_V1}/${request.uid}/profile/summary`
    );
  }

  public getMyProfileSummary() {
    return this.get<GetMyProfileSummaryResponse>(`${this.ROUTE_V1}/me/profile/summary`);
  }

  public getMyAvatarBodies() {
    return this.get<AvatarBody[]>(`${this.ROUTE_V1}/me/profile/avatar/bodies`);
  }

  public getMyAvatarFaces() {
    return this.get<AvatarFace[]>(`${this.ROUTE_V1}/me/profile/avatar/faces`);
  }

  public updateMyWallet(request: UpdateMyWalletRequest) {
    return this.put<void>(`${this.ROUTE_V1}/me/profile/wallet`, request);
  }

  public updateMyBio(request: UpdateMyBioRequest) {
    return this.put<void>(`${this.ROUTE_V1}/me/profile/bio`, request);
  }

  public updateMyAvatarFace(request: UpdateMyAvatarFaceRequest) {
    return this.put<void>(`${this.ROUTE_V1}/me/profile/avatar/face`, request);
  }

  public updateMyAvatarBody(request: UpdateMyAvatarBodyRequest) {
    return this.put<void>(`${this.ROUTE_V1}/me/profile/avatar/body`, request);
  }

  public async requestAuthStart() {
    return this.post<AuthStartResponse>(`${this.ROUTE_V1}${authConfig.backend.authStartPath}`);
  }
}
