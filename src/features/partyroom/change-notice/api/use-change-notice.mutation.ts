import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { partyroomsService } from '@/shared/api/http/services';
import { APIError } from '@/shared/api/http/types/@shared';
import { useStores } from '@/shared/lib/store/stores.context';

export default function useChangeNoticeMutation() {
  const partyroomId = useStores().useCurrentPartyroom((state) => state.id);

  return useMutation<void, AxiosError<APIError>, string>({
    mutationFn: async (content) => {
      if (!partyroomId) {
        throw new Error('partyroomId is not found. maybe you are not in the partyroom.');
      }
      return await partyroomsService.updateNotice({ partyroomId, content });
    },
  });
}
