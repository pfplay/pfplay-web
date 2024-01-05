import { getSession } from 'next-auth/react';
import { ProfileResponse, UserClient } from '@/api/@types/User';
import { pfpAxiosInstance } from '@/api/client';
import { getServerAuthSession } from '@/utils/authOptions';

const ROUTE_V1 = 'v1/user';

export const UserService: UserClient = {
  login: async (request) => {
    return await pfpAxiosInstance.post(`${ROUTE_V1}/info`, request);
  },
  getProfile: async () => {
    return await pfpAxiosInstance.get(`${ROUTE_V1}/profile`);
  },
  getProfileRegisteredStatus: async () => {
    const session = (await getSession()) ?? (await getServerAuthSession());

    if (!session) {
      return {
        authorized: false,
        hasProfile: false,
      };
    }

    const profile = (await pfpAxiosInstance.get(`${ROUTE_V1}/profile`)) as ProfileResponse;

    return {
      authorized: true,
      hasProfile: !!profile.nickname,
    };
  },
};
