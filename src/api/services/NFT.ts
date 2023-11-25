import axios from 'axios';
import { NFTClient } from '../@types/NFT';

const apiKey = process.env.NEXT_PUBLIC_OPENSEA_ID as string;
const options = (address: string) => ({
  method: 'GET',
  url: 'https://api.opensea.io/api/v1/assets',
  params: {
    owner: address,
    order_direction: 'desc',
    limit: '200',
    include_orders: 'false',
  },
  headers: { accept: 'application/json', 'X-API-KEY': apiKey },
});

export const NFTService: NFTClient = {
  getNFTs: async (address: string) => {
    const response = await axios.request(options(address));
    return await response.data;
  },
};
