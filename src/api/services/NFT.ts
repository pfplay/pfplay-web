import { NFTClient, OpenSeaAssetsResponse } from '../@types/NFT';
import { nextAxiosInstance } from '../client';

export const NFTService: NFTClient = {
  getNFTs: async (address) => {
    // NOTE:  uncomment and use it for testing
    // const response = await nextAxiosInstance.get<OpenSeaAssetsResponse>(
    //   `/nft/0xa4d1D0060eAd119cdF04b7C797A061400C6Ba8a7`
    // );
    const response = await nextAxiosInstance.get<OpenSeaAssetsResponse>(`/nft/${address}`);

    return response.data;
  },
};
