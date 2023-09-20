import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { AvatarBody } from '@/api/@types/Avatar';
import { AVATAR_BODY_LIST_QUERY_KEY } from '@/api/react-query/avatar/keys';
import { AvatarService } from '@/api/services/Avatar';
import { FIVE_MINUTES } from '@/constants/time';

const useFetchAvatarBodyList = () => {
  return useQuery<AvatarBody[], AxiosError>({
    queryKey: [AVATAR_BODY_LIST_QUERY_KEY],
    queryFn: () => AvatarService.getBodyList(),
    keepPreviousData: true,
    staleTime: 0,
    cacheTime: FIVE_MINUTES,
  });
};

export default useFetchAvatarBodyList;
