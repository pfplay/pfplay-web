import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { partyroomsService } from '@/shared/api/http/services';
import { APIError } from '@/shared/api/http/types/@shared';
import {
  CreatePartyroomPayload,
  CreatePartyroomResponse,
} from '@/shared/api/http/types/partyrooms';

export default function useCreatePartyroom() {
  return useMutation<CreatePartyroomResponse, AxiosError<APIError>, CreatePartyroomPayload>({
    mutationFn: (request) => partyroomsService.create(request),
  });
}
