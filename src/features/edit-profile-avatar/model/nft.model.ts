import { OwnedNft } from 'alchemy-sdk/dist/src/types/nft-types';
import axios from 'axios';
import { SetOptional } from 'type-fest';
import { AvatarFace } from '@/shared/api/types/users';

export type Model = OwnedNft;

export type RefinedModel = SetOptional<AvatarFace, 'id' | 'name'>;

export async function refineList(models: Model[]): Promise<RefinedModel[]> {
  const refined: OwnedNft[] = [];

  const checkedList = await Promise.allSettled(imageHealthCheckMap(models));

  for (const checked of checkedList) {
    if (checked.status === 'fulfilled' && checked.value !== null) {
      refined.push(checked.value);
    }
  }

  return refined.map((nft) => ({
    // id는 없음
    name: nft.name,
    resourceUri: nft.image.thumbnailUrl as string,
    available: true,
  }));
}

function imageHealthCheckMap(list: Model[]) {
  return list.map(async (nft) => {
    if (!nft.image?.thumbnailUrl) return null;

    try {
      const res = await axios.get(nft.image.thumbnailUrl);
      return res.status === 200 ? nft : null;
    } catch {
      return null;
    }
  });
}
