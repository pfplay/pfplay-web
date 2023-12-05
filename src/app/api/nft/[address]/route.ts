import { NextResponse } from 'next/server';
import { z } from 'zod';
import { NFTService } from '@/api/services/NFT';

export const dynamic = 'force-dynamic';

export const getNftsPayloadSchema = z.object({
  address: z.string(),
});

export async function GET(_: Request, { params }: { params: { address: string } }) {
  const { address } = getNftsPayloadSchema.parse(params);

  try {
    const data = await NFTService.getNFTs(address);

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);

    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 422 });
    }

    if (error instanceof Error) {
      return new Response(error.message, { status: 500 });
    }

    return new Response('Something went wrong', { status: 500 });
  }
}
