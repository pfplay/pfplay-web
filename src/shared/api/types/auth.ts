interface SignInGuestRequest {}

interface SignInGuestResponse {}

export interface AuthClient {
  signInGuest: (request: SignInGuestRequest) => Promise<SignInGuestResponse>;

  /**
   * @deprecated 정식 API 개발되기 전 사용할 임시 API입니다.
   */
  temporary_SignInFullMember: () => Promise<void>;
  /**
   * @deprecated 정식 API 개발되기 전 사용할 임시 API입니다.
   */
  temporary_SignInAssociateMember: () => Promise<void>;
}
