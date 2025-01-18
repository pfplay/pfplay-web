import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useRemoveCurrentPartyroomCaches } from '@/entities/current-partyroom';
import { partyroomsService } from '@/shared/api/http/services';
import { APIError } from '@/shared/api/http/types/@shared';
import { ExitPayload } from '@/shared/api/http/types/partyrooms';

export function useExitPartyroom() {
  const removeCurrentPartyroomCaches = useRemoveCurrentPartyroomCaches();

  return useMutation<void, AxiosError<APIError>, ExitPayload>({
    mutationFn: (request) => partyroomsService.exit(request),
    onSuccess: removeCurrentPartyroomCaches,
  });
}
