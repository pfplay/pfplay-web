import { mockPlayListItemConfig } from '@/constants/__mock__/mockPlayListItemConfig';
import { delay } from '@/utils/delay';
import { PartiesClient, PartyRoom } from '../@types/Parties';
import { axiosInstance } from '../client';

const ROUTE_V1 = 'v1/party-room';

export const PartiesService: PartiesClient = {
  createPartyRoom: async (partyRoomConfig: PartyRoom) => {
    return await axiosInstance.post(`${ROUTE_V1}/create`, partyRoomConfig);
  },
  getPartyRoomList: async () => {
    // TODO: API 준비되면 대체
    await delay(5000);

    return [...mockPlayListItemConfig];
  },
};
