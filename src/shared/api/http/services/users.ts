import { authConfig } from '@/shared/config/oauth';
import { Singleton } from '@/shared/lib/decorators/singleton';
import {
  clearStoredCodeVerifier,
  createPKCEParams,
  getStoredCodeVerifier,
  parseCallbackParams,
} from '@/shared/lib/functions/pkce';
import HTTPClient from '../client/client';
import type {
  SignInRequest,
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
  TokenExchangeRequest,
  TokenExchangeResponse,
} from '../types/users';

@Singleton
export default class UsersService extends HTTPClient implements UsersClient {
  private ROUTE_V1 = 'v1/users';

  public async initiateLogin({ oauth2Provider }: SignInRequest) {
    try {
      const authStart = await this.requestAuthStart();
      if (!authStart.success) {
        throw new Error(authStart.message || 'Failed to start authentication');
      }

      const { codeChallenge, codeChallengeMethod } = await createPKCEParams();

      const config = authConfig[oauth2Provider];
      const params = new URLSearchParams({
        client_id: config.clientId,
        redirect_uri: config.redirectUri,
        scope: config.scope,
        response_type: 'code',
        code_challenge: codeChallenge,
        code_challenge_method: codeChallengeMethod,
      });

      const authUrl = `${config.authUrl}?${params.toString()}`;
      window.location.href = authUrl;
    } catch (error) {
      console.error('Login initiation failed:', error);
      alert(`${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public async exchangeCodeForToken({ oauth2Provider }: TokenExchangeRequest) {
    const params = parseCallbackParams();
    if (params.error) {
      throw new Error(params.error_description || params.error);
    }
    if (!params.code) {
      throw new Error('Authorization code not received');
    }
    const { code } = params;

    try {
      const codeVerifier = getStoredCodeVerifier();
      if (!codeVerifier) {
        throw new Error('Code verifier not found in storage');
      }

      const request = {
        oauth2Provider,
        code,
        codeVerifier,
      };

      const response = await this.post<TokenExchangeResponse>(
        `${this.ROUTE_V1}${authConfig.backend.tokenExchangePath}`,
        request
      );

      if (!response.success) {
        throw new Error(response.message || 'Token exchange failed');
      }

      if (response.success) {
        clearStoredCodeVerifier();
      }
      return response;
    } catch (error) {
      console.error('Token exchange failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
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
