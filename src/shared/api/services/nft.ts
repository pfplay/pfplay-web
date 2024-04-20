import axios from 'axios';
import { nextAxiosInstance } from '@/shared/api/clients/http/client';
import { NFTClient } from '@/shared/api/types/nft';

export const NFTService: NFTClient = {
  getNFTs: async (address) => {
    // NOTE:  uncomment and use it for testing
    // return await nextAxiosInstance.get(`/nft/0xa4d1D0060eAd119cdF04b7C797A061400C6Ba8a7`);

    return await nextAxiosInstance.get(`/nft/${address}`);
  },
  checkImageUrlStatus: async (imageUrl) => {
    return await axios.get(`${imageUrl}`);
  },
};
