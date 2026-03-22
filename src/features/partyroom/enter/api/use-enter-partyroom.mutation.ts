import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { partyroomsService } from '@/shared/api/http/services';
import { APIError } from '@/shared/api/http/types/@shared';
import { EnterPayload, EnterResponse } from '@/shared/api/http/types/partyrooms';

export function useEnterPartyroom() {
  return useMutation<EnterResponse, AxiosError<APIError>, EnterPayload>({
    mutationFn: (request) => partyroomsService.enter(request),
  });
}
