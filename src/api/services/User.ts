import { getSession } from 'next-auth/react';
import { ProfileResponse, UserClient } from '@/api/@types/User';
import { pfpAxiosInstance } from '@/api/client';
import { getServerAuthSession } from '@/utils/authOptions';
import { delay } from '@/utils/delay';

const ROUTE_V1 = 'v1/user';

export const UserService: UserClient = {
  login: async (request) => {
    return await pfpAxiosInstance.post(`${ROUTE_V1}/info`, request);
  },
  getProfile: async () => {
    return await pfpAxiosInstance.get(`${ROUTE_V1}/profile`);
  },
  updateProfile: async (request) => {
    await delay(3000);

    return request;
    // return await pfpAxiosInstance.patch(`${ROUTE_V1}/profile`, request);
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
