import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import PartyroomsService from '@/shared/api/http/services/partyrooms';
import { APIError } from '@/shared/api/http/types/@shared';
import {
  GetRoomIdByDomainResponse,
  GetRoomIdByDomainPayload,
} from '@/shared/api/http/types/partyrooms';

export default function useGetPartyroomIdByDomain() {
  return useMutation<GetRoomIdByDomainResponse, AxiosError<APIError>, GetRoomIdByDomainPayload>({
    mutationFn: ({ domain }) => PartyroomsService.getRoomIdByDomain({ domain }),
  });
}
