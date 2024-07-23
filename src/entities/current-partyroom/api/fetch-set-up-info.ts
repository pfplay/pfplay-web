import { AxiosError } from 'axios';
import PartyroomsService from '@/shared/api/http/services/partyrooms';
import { APIError } from '@/shared/api/http/types/@shared';
import type { GetSetUpInfoResponse } from '@/shared/api/http/types/partyrooms';
import silent, { SilentOptions } from '@/shared/lib/functions/silent';

export default async function fetchSetUpInfo(
  partyroomId: number,
  { onSuccess, onError }: SilentOptions<GetSetUpInfoResponse, AxiosError<APIError>>
) {
  await silent(PartyroomsService.getSetupInfo({ partyroomId }), {
    onSuccess,
    onError,
  });
}
