import axios from 'axios';
import { NFTClient } from '../@types/NFT';

const OPENSEA_API_KEY = process.env.NEXT_PUBLIC_OPENSEA_ID;
const OPENSEA_BASE_URL = process.env.NEXT_PUBLIC_OPENSEA_BASE_URL;

const options = (address: string) => ({
  method: 'GET',
  url: `${OPENSEA_BASE_URL}/v1/assets`,
  params: {
    owner: address,
    order_direction: 'desc',
    limit: '200',
    include_orders: 'false',
  },
  headers: { accept: 'application/json', 'X-API-KEY': OPENSEA_API_KEY },
});

export const NFTService: NFTClient = {
  getNFTs: async ({ address }) => {
    const response = await axios.request(options(address));
    return await response.data;
  },
};
