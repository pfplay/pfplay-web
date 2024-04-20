import { pfpAxiosInstance } from '@/api/clients/http/client';
import { AvatarClient } from '@/api/types/avatar';
import { fixtureAvatarPartsList } from '@/constants/__fixture__/avatar-parts-list.fixture';
import { delay } from '@/shared/lib/functions/delay';

const ROUTE_V1 = 'v1/avatar';

export const AvatarService: AvatarClient = {
  getBodyList: async () => {
    return await pfpAxiosInstance.get(`${ROUTE_V1}/body-list`);
  },
  getFaceList: async () => {
    // TODO: Replace with real API call
    await delay(5000);
    return [...fixtureAvatarPartsList];
  },
};
