import { UserClient } from '@/api/@types/User';
import { pfpAxiosInstance } from '@/api/client';

const ROUTE_V1 = 'v1/user';

export const UserService: UserClient = {
  login: async (request) => {
    return await pfpAxiosInstance.post(`${ROUTE_V1}/info`, request);
  },
  getProfile: async () => {
    return await pfpAxiosInstance.get(`${ROUTE_V1}/profile`);
  },
  updateProfile: async (request) => {
    return await pfpAxiosInstance.patch(`${ROUTE_V1}/profile`, request);
  },
};
