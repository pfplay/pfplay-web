import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { QueryKeys } from '@/shared/api/react-query/keys';
import { UsersService } from '@/shared/api/services/users';
import { APIError } from '@/shared/api/types/@shared';
import { AvatarBody } from '@/shared/api/types/users';
import { FIVE_MINUTES } from '@/shared/config/time';

export function useFetchAvatarBodies() {
  return useQuery<AvatarBody[], AxiosError<APIError>>({
    queryKey: [QueryKeys.AvatarBodies],
    queryFn: UsersService.getMyAvatarBodies,
    staleTime: 0,
    gcTime: FIVE_MINUTES,
  });
}
