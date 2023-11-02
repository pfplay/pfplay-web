import { AvatarClient } from '@/api/@types/Avatar';
import { mockAvatarPartsList } from '@/constants/__mock__/mockAvatarPartsList';
import { axiosInstance } from '../client';

const ROUTE_V1 = 'v1/avatar';

export const AvatarService: AvatarClient = {
  getBodyList: async () => {
    return await axiosInstance.get(`${ROUTE_V1}/body-list`);
  },
  getFaceList: async () => {
    // TODO: Replace with real API call
    return new Promise((resolve) => setTimeout(() => resolve([...mockAvatarPartsList]), 5000));
  },
};
