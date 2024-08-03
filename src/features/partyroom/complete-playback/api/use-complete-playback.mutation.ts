import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import DjsService from '@/shared/api/http/services/djs';
import { APIError } from '@/shared/api/http/types/@shared';
import { useStores } from '@/shared/lib/store/stores.context';

export function useCompletePlayback() {
  const { useCurrentPartyroom } = useStores();
  const partyroomId = useCurrentPartyroom((state) => state.id);

  return useMutation<void, AxiosError<APIError>>({
    mutationFn: () => {
      if (!partyroomId) {
        throw new Error(`current partyroom's id is not provided`);
      }
      return DjsService.completePlayback({ partyroomId });
    },
  });
}
