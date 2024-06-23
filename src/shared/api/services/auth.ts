import { pfpAxiosInstance } from '@/shared/api/clients/http/client';
import { AuthClient } from '@/shared/api/types/auth';

export const AuthService: AuthClient = {
  signInGuest: () => {
    return pfpAxiosInstance.post(`/v1/guests/sign`);
  },

  temporary_SignInFullMember: () => {
    return pfpAxiosInstance.post(`/v1/members/sign/temporary/full-member`);
  },
  temporary_SignInAssociateMember: () => {
    return pfpAxiosInstance.post(`/v1/members/sign/temporary/associate-member`);
  },
};
