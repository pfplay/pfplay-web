import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { QueryKeys } from '@/shared/api/http/query-keys';
import { usersService } from '@/shared/api/http/services';
import { APIError } from '@/shared/api/http/types/@shared';
import { AvatarBody } from '@/shared/api/http/types/users';

export function useUpdateMyAvatar() {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError<APIError>, { body: AvatarBody; faceUri?: string }>({
    mutationFn: async ({ body, faceUri }) => {
      if (!body.combinable) {
        await usersService.updateMyAvatarBody({ avatarBodyUri: body.resourceUri });
        return;
      }
      if (!faceUri) {
        throw new Error('faceUri is required when the body is combinable');
      }
      await Promise.all([
        usersService.updateMyAvatarBody({ avatarBodyUri: body.resourceUri }),
        usersService.updateMyAvatarFace({ avatarFaceUri: faceUri }),
      ]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.Me],
      });
    },
  });
}
