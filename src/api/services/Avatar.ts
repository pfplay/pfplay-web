import { AvatarClient } from '@/api/@types/Avatar';
import { axiosInstance } from '@/api/client';

const ROUTE_V1 = 'v1/avatar';

export const AvatarService: AvatarClient = {
  getBodyList: async () => {
    return await axiosInstance.get(`${ROUTE_V1}/body-list`);
  },
};
