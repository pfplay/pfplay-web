import { PartiesClient } from '@/api/@types/Parties';
import { pfpAxiosInstance } from '@/api/clients/http/client';

const ROUTE_V1 = 'v1/party-room';

export const PartiesService: PartiesClient = {
  create: async (request) => {
    return await pfpAxiosInstance.post(`${ROUTE_V1}/create`, request);
  },
  getList: async (request) => {
    return await pfpAxiosInstance.get(`${ROUTE_V1}/list`, {
      params: request,
    });
  },
};
