import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import PartyroomsService from '@/shared/api/http/services/partyrooms';
import { APIError } from '@/shared/api/http/types/@shared';
import {
  CreatePartyroomPayload,
  CreatePartyroomResponse,
} from '@/shared/api/http/types/partyrooms';

export default function useCreatePartyroom() {
  return useMutation<CreatePartyroomResponse, AxiosError<APIError>, CreatePartyroomPayload>({
    mutationFn: PartyroomsService.create,
  });
}
