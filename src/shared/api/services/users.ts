import { pfpAxiosInstance } from '@/shared/api/clients/http/client';
import { UsersClient } from '@/shared/api/types/users';

const ROUTE_V1 = 'v1/users';

export const UsersService: UsersClient = {
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
