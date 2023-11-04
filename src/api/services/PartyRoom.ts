import { PartyRoom } from '../@types/PartyRoom';
import { axiosInstance } from '../client';

const ROUTE_V1 = 'v1/party-room';

export const PartyRoomService = {
  createPartyRoom: async (payload: PartyRoom) => {
    return await axiosInstance.post(`${ROUTE_V1}/create`, payload);
  },
};
