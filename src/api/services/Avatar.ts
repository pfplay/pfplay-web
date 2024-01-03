import { AvatarClient } from '@/api/@types/Avatar';
import { pfpAxiosInstance } from '@/api/client';
import { mockAvatarPartsList } from '@/constants/__mock__/mockAvatarPartsList';
import { delay } from '@/utils/delay';

const ROUTE_V1 = 'v1/avatar';

export const AvatarService: AvatarClient = {
  getBodyList: async () => {
    return await pfpAxiosInstance.get(`${ROUTE_V1}/body-list`);
  },
  getFaceList: async () => {
    // TODO: Replace with real API call
    await delay(5000);
    return [...mockAvatarPartsList];
  },
};
