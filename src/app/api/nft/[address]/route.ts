import { NextResponse } from 'next/server';
import { z } from 'zod';
import { nextAxiosInstance } from '@/api/clients/http/client';

const getNftsPayloadSchema = z.object({
  address: z.string(),
});

const options = (address: string) => ({
  method: 'GET',
  url: `${process.env.ALCHEMY_BASE_URL}/nft/v3/${process.env.NEXT_PUBLIC_ALCHEMY_ID}/getNFTsForOwner`,
  params: {
    owner: address,
    withMetadata: true,
    order_direction: 'desc',
    'excludeFilters[]': 'SPAM',
    pageSize: '100',
  },
  headers: { accept: 'application/json' },
});

export async function GET(_: Request, { params }: { params: { address: string } }) {
  try {
    const { address } = getNftsPayloadSchema.parse(params);

    const response = await nextAxiosInstance.request(options(address));

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 400 });
    }

    if (error instanceof Error) {
      return new Response(error.message, { status: 500 });
    }

    return new Response('Something went wrong', { status: 500 });
  }
}
