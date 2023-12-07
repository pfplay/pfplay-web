import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getNftsPayloadSchema } from '@/api/@types/NFT';
import { axiosInstance } from '@/api/client';

const options = (address: string) => ({
  method: 'GET',
  url: `${process.env.OPENSEA_BASE_URL}/v1/assets`,
  params: {
    owner: address,
    order_direction: 'desc',
    limit: '200',
    include_orders: 'false',
  },
  headers: { accept: 'application/json', 'X-API-KEY': process.env.OPENSEA_ID },
});

export async function GET(_: Request, { params }: { params: { address: string } }) {
  try {
    const { address } = getNftsPayloadSchema.parse(params);

    const response = await axiosInstance.request(options(address));

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.log({ error });
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 400 });
    }

    if (error instanceof Error) {
      return new Response(error.message, { status: 500 });
    }

    return new Response('Something went wrong', { status: 500 });
  }
}
