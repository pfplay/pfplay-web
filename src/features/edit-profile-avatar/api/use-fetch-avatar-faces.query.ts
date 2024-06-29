import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { QueryKeys } from '@/shared/api/react-query/keys';
import { UsersService } from '@/shared/api/services/users';
import { APIError } from '@/shared/api/types/@shared';
import { AvatarFace } from '@/shared/api/types/users';
import { FIVE_MINUTES, ONE_MINUTE } from '@/shared/config/time';

export function useFetchAvatarFaces() {
  return useQuery<AvatarFace[], AxiosError<APIError>>({
    queryKey: [QueryKeys.AvatarFaces],
    queryFn: UsersService.getMyAvatarFaces,
    staleTime: ONE_MINUTE,
    gcTime: FIVE_MINUTES,
  });
}
