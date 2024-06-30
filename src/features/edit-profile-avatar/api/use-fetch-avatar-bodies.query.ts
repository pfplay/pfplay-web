import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { QueryKeys } from '@/shared/api/http/query-keys';
import { UsersService } from '@/shared/api/http/services/users';
import { APIError } from '@/shared/api/http/types/@shared';
import { AvatarBody } from '@/shared/api/http/types/users';
import { FIVE_MINUTES, ONE_MINUTE } from '@/shared/config/time';

export function useFetchAvatarBodies() {
  return useQuery<AvatarBody[], AxiosError<APIError>>({
    queryKey: [QueryKeys.AvatarBodies],
    queryFn: UsersService.getMyAvatarBodies,
    staleTime: ONE_MINUTE,
    gcTime: FIVE_MINUTES,
  });
}
