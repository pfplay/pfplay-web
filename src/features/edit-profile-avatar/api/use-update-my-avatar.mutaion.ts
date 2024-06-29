import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { QueryKeys } from '@/shared/api/react-query/keys';
import { UsersService } from '@/shared/api/services/users';
import { APIError } from '@/shared/api/types/@shared';
import { AvatarBody } from '@/shared/api/types/users';

export function useUpdateMyAvatar() {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError<APIError>, { body: AvatarBody; faceUri?: string }>({
    mutationFn: async ({ body, faceUri }) => {
      if (!body.combinable) {
        await UsersService.updateMyAvatarBody({ avatarBodyUri: body.resourceUri });
        // await UsersService.updateMyAvatarFace({ avatarFaceUri: '' }); // TODO: 명시적인 clear 필요 없는지 재확인 필요 (https://pfplay.slack.com/archives/C051N8A0ZSB/p1719686576907309?thread_ts=1719686253.407909&cid=C051N8A0ZSB)
        return;
      }
      if (!faceUri) {
        throw new Error('faceUri is required when the body is combinable');
      }
      await Promise.all([
        UsersService.updateMyAvatarBody({ avatarBodyUri: body.resourceUri }),
        UsersService.updateMyAvatarFace({ avatarFaceUri: faceUri }),
      ]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.Me],
      });
    },
  });
}
