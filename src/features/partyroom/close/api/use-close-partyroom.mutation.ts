import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useRemoveCurrentPartyroomCaches } from '@/entities/current-partyroom';
import { partyroomsService } from '@/shared/api/http/services';
import { APIError } from '@/shared/api/http/types/@shared';
import { useStores } from '@/shared/lib/store/stores.context';

export default function useClosePartyroom() {
  const partyroomId = useStores().useCurrentPartyroom((state) => state.id);
  const removeCurrentPartyroomCaches = useRemoveCurrentPartyroomCaches();

  return useMutation<void, AxiosError<APIError>>({
    mutationFn: async () => {
      if (!partyroomId) {
        throw new Error('partyroomId is not found. maybe you are not in the partyroom.');
      }
      return await partyroomsService.close({ partyroomId });
    },
    onSuccess: removeCurrentPartyroomCaches,
  });
}
