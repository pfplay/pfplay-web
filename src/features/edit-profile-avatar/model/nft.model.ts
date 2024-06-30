import { SetOptional } from 'type-fest';
import { NFTService } from '@/shared/api/services/nft';
import { OwnedNft } from '@/shared/api/types/nft';
import { AvatarFace } from '@/shared/api/types/users';

export type Model = OwnedNft;

export type RefinedModel = SetOptional<AvatarFace, 'id'>;

export async function refineList(models: Model[]): Promise<RefinedModel[]> {
  const refined: OwnedNft[] = [];

  const checkedList = await Promise.allSettled(requestImageUrlHealthCheck(models));

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

function requestImageUrlHealthCheck(list: Model[]) {
  return list.map(async (nft) => {
    if (!nft.image?.thumbnailUrl) return null;

    try {
      const res = await NFTService.checkImageUrlStatus(nft.image.thumbnailUrl);
      return res.status === 200 ? nft : null;
    } catch {
      return null;
    }
  });
}
