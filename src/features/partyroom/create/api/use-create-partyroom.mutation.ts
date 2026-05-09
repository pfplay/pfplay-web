import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { partyroomsService } from '@/shared/api/http/services';
import { APIError } from '@/shared/api/http/types/@shared';
import {
  CreatePartyroomPayload,
  CreatePartyroomResponse,
} from '@/shared/api/http/types/partyrooms';
import { identify, track } from '@/shared/lib/analytics';

export default function useCreatePartyroom() {
  return useMutation<CreatePartyroomResponse, AxiosError<APIError>, CreatePartyroomPayload>({
    mutationFn: (request) => partyroomsService.create(request),
    onSuccess: (data, variables) => {
      // stage_type is server-determined and not present in the create response;
      // omitted here pending a follow-up that resolves it via PartyroomDetailSummary.
      track('Partyroom Created', {
        partyroom_id: data.partyroomId,
        playback_time_limit: variables.playbackTimeLimit,
      });
      identify({ setOnce: { has_created_partyroom: true } });
    },
  });
}
