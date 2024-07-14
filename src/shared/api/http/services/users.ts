import { Singleton } from '@/shared/lib/decorators/singleton';
import { pfpAxiosInstance } from '../client/client';
import {
  SignInRequest,
  SignInGuestRequest,
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
} from '../types/users';

@Singleton
class UsersService implements UsersClient {
  private ROUTE_V1 = 'v1/users';

  public signIn(request: SignInRequest) {
    if (typeof window === 'undefined') return;

    const url = new URL(`${pfpAxiosInstance.defaults.baseURL}${this.ROUTE_V1}/members/sign`);
    url.searchParams.append('oauth2Provider', request.oauth2Provider);

    window.location.href = url.toString();
  }

  public signInGuest(request: SignInGuestRequest) {
    return pfpAxiosInstance.post<unknown, void>(`${this.ROUTE_V1}/guests/sign`, request);
  }

  public signOut() {
    return pfpAxiosInstance.post<unknown, void>(`${this.ROUTE_V1}/logout`);
  }

  public temporary_SignInFullMember() {
    return pfpAxiosInstance.post<unknown, void>(
      `${this.ROUTE_V1}/members/sign/temporary/full-member`
    );
  }

  public temporary_SignInAssociateMember() {
    return pfpAxiosInstance.post<unknown, void>(
      `${this.ROUTE_V1}/members/sign/temporary/associate-member`
    );
  }

  public getMyInfo() {
    return pfpAxiosInstance.get<unknown, GetMyInfoResponse>(`${this.ROUTE_V1}/me/info`);
  }

  public getUserProfileSummary(request: GetUserProfileSummaryRequest) {
    return pfpAxiosInstance.get<unknown, GetUserProfileSummaryResponse>(
      `${this.ROUTE_V1}/${request.uid}/profile/summary`
    );
  }

  public getMyProfileSummary() {
    return pfpAxiosInstance.get<unknown, GetMyProfileSummaryResponse>(
      `${this.ROUTE_V1}/me/profile/summary`
    );
  }

  public getMyAvatarBodies() {
    return pfpAxiosInstance.get<unknown, AvatarBody[]>(`${this.ROUTE_V1}/me/profile/avatar/bodies`);
  }

  public getMyAvatarFaces() {
    return pfpAxiosInstance.get<unknown, AvatarFace[]>(`${this.ROUTE_V1}/me/profile/avatar/faces`);
  }

  public updateMyWallet(request: UpdateMyWalletRequest) {
    return pfpAxiosInstance.put<unknown, void>(`${this.ROUTE_V1}/me/profile/wallet`, request);
  }

  public updateMyBio(request: UpdateMyBioRequest) {
    return pfpAxiosInstance.put<unknown, void>(`${this.ROUTE_V1}/me/profile/bio`, request);
  }

  public updateMyAvatarFace(request: UpdateMyAvatarFaceRequest) {
    return pfpAxiosInstance.put<unknown, void>(`${this.ROUTE_V1}/me/profile/avatar/face`, request);
  }

  public updateMyAvatarBody(request: UpdateMyAvatarBodyRequest) {
    return pfpAxiosInstance.put<unknown, void>(`${this.ROUTE_V1}/me/profile/avatar/body`, request);
  }
}

const instance = new UsersService();
export default instance;
