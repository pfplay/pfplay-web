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
  TokenExchangeResponse,
  TokenExchangeRequest,
  InitiateLoginRequest,
  InitiateLoginResponse,
} from '../types/users';

@Singleton
export default class UsersService extends HTTPClient implements UsersClient {
  private ROUTE_USER = 'v1/users';
  private ROUTE_AUTH = 'v1/auth';

  public async initiateLogin(request: InitiateLoginRequest) {
    return this.post<InitiateLoginResponse>(`${this.ROUTE_AUTH}/oauth/url`, request);
  }

  public exchangeToken(request: TokenExchangeRequest) {
    return this.post<TokenExchangeResponse>(`${this.ROUTE_AUTH}/oauth/callback`, request);
  }

  public signOut() {
    return this.post<void>(`${this.ROUTE_AUTH}/logout`);
  }

  public signInGuest() {
    return this.post<void>(`${this.ROUTE_USER}/guests/sign`);
  }

  public temporary_SignInFullCrew() {
    return this.post<void>(`${this.ROUTE_USER}/members/sign/temporary/full-member`);
  }

  public temporary_SignInAssociateCrew() {
    return this.post<void>(`${this.ROUTE_USER}/members/sign/temporary/associate-member`);
  }

  public getMyInfo() {
    return this.get<GetMyInfoResponse>(`${this.ROUTE_USER}/me/info`);
  }

  public getUserProfileSummary(request: GetUserProfileSummaryRequest) {
    return this.get<GetUserProfileSummaryResponse>(
      `${this.ROUTE_USER}/${request.uid}/profile/summary`
    );
  }

  public getMyProfileSummary() {
    return this.get<GetMyProfileSummaryResponse>(`${this.ROUTE_USER}/me/profile/summary`);
  }

  public getMyAvatarBodies() {
    return this.get<AvatarBody[]>(`${this.ROUTE_USER}/me/profile/avatar/bodies`);
  }

  public getMyAvatarFaces() {
    return this.get<AvatarFace[]>(`${this.ROUTE_USER}/me/profile/avatar/faces`);
  }

  public updateMyWallet(request: UpdateMyWalletRequest) {
    return this.put<void>(`${this.ROUTE_USER}/me/profile/wallet`, request);
  }

  public updateMyBio(request: UpdateMyBioRequest) {
    return this.put<void>(`${this.ROUTE_USER}/me/profile/bio`, request);
  }

  public updateMyAvatarFace(request: UpdateMyAvatarFaceRequest) {
    return this.put<void>(`${this.ROUTE_USER}/me/profile/avatar/face`, request);
  }

  public updateMyAvatarBody(request: UpdateMyAvatarBodyRequest) {
    return this.put<void>(`${this.ROUTE_USER}/me/profile/avatar/body`, request);
  }
}
