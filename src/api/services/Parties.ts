import { mockPlayListItemConfig } from '@/constants/__mock__/mockPlayListItemConfig';
import { delay } from '@/utils/delay';
import { PartiesClient } from '../@types/Parties';
import { pfpAxiosInstance } from '../client';

const ROUTE_V1 = 'v1/party-room';

export const PartiesService: PartiesClient = {
  create: async (request) => {
    return await pfpAxiosInstance.post(`${ROUTE_V1}/create`, request);
  },
  getPartyRoomList: async () => {
    // TODO: API 준비되면 대체
    await delay(5000);

    return [...mockPlayListItemConfig];
  },
};
