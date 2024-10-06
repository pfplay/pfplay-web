import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import PartyroomsService from '@/shared/api/http/services/partyrooms';
import { APIError } from '@/shared/api/http/types/@shared';
import { ImposePenaltyPayload } from '@/shared/api/http/types/partyrooms';

export default function useImposePenaltyMutation() {
  return useMutation<void, AxiosError<APIError>, ImposePenaltyPayload>({
    mutationFn: (payload) => PartyroomsService.imposePenalty(payload),
  });
}
