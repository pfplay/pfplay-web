import { pfpAxiosInstance } from '@/shared/api/clients/http/client';
import { UsersClient } from '@/shared/api/types/users';

const ROUTE_V1 = 'v1/users';

export const UsersService: UsersClient = {
  signInGuest: () => {
    return pfpAxiosInstance.post(`${ROUTE_V1}/guests/sign`);
  },
  signOut: () => {
    return pfpAxiosInstance.post(`${ROUTE_V1}/logout`);
  },
  temporary_SignInFullMember: () => {
    return pfpAxiosInstance.post(`${ROUTE_V1}/members/sign/temporary/full-member`);
  },
  temporary_SignInAssociateMember: () => {
    return pfpAxiosInstance.post(`${ROUTE_V1}/members/sign/temporary/associate-member`);
  },
  getMyInfo: () => {
    return pfpAxiosInstance.get(`${ROUTE_V1}/me/info`);
  },
  getUserProfileSummary: ({ uid }) => {
    return pfpAxiosInstance.get(`${ROUTE_V1}/${uid}/profile/summary`);
  },
  getMyProfileSummary: () => {
    return pfpAxiosInstance.get(`${ROUTE_V1}/me/profile/summary`);
  },
  getMyAvatarBodies: () => {
    return pfpAxiosInstance.get(`${ROUTE_V1}/me/profile/avatar/bodies`);
  },
  getMyAvatarFaces: () => {
    return pfpAxiosInstance.get(`${ROUTE_V1}/me/profile/avatar/faces`);
  },
  updateMyWallet: (request) => {
    return pfpAxiosInstance.put(`${ROUTE_V1}/me/profile/wallet`, request);
  },
  updateMyBio: (request) => {
    return pfpAxiosInstance.put(`${ROUTE_V1}/me/profile/bio`, request);
  },
  updateMyAvatarFace: (request) => {
    return pfpAxiosInstance.put(`${ROUTE_V1}/me/profile/avatar/face`, request);
  },
  updateMyAvatarBody: (request) => {
    return pfpAxiosInstance.put(`${ROUTE_V1}/me/profile/avatar/body`, request);
  },
};
