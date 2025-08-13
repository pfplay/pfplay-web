import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import useIsNft from '@/entities/wallet/lib/use-is-nft.hook';
import { QueryKeys } from '@/shared/api/http/query-keys';
import { usersService } from '@/shared/api/http/services';
import { APIError } from '@/shared/api/http/types/@shared';
import { AvatarBody, AvatarFacePos } from '@/shared/api/http/types/users';

export function useUpdateMyAvatar() {
  const queryClient = useQueryClient();
  const isNft = useIsNft();

  return useMutation<
    void,
    AxiosError<APIError>,
    { body: AvatarBody; faceUri?: string; facePos?: AvatarFacePos }
  >({
    mutationFn: async ({ body, faceUri, facePos }) => {
      if (!body.combinable) {
        await usersService.updateMyAvatar({
          avatarCompositionType: 'SINGLE_BODY',
          body: {
            uri: body.resourceUri,
          },
        });
        return;
      }
      if (!faceUri || !facePos) {
        throw new Error('faceUri and facePos are required when the body is combinable');
      }
      await usersService.updateMyAvatar({
        avatarCompositionType: 'BODY_WITH_FACE',
        body: {
          uri: body.resourceUri,
        },
        face: {
          sourceType: isNft(faceUri) ? 'NFT_URI' : 'INTERNAL_IMAGE',
          uri: faceUri,
          transform: facePos,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.Me],
      });
    },
  });
}
