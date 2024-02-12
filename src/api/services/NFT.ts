import axios from 'axios';
import { NFTClient } from '@/api/@types/NFT';
import { nextAxiosInstance } from '@/api/clients/http/client';

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
