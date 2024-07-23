import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useCurrentPartyroom } from '@/entities/current-partyroom';
import PartyroomsService from '@/shared/api/http/services/partyrooms';
import { APIError } from '@/shared/api/http/types/@shared';
import { EnterPayload, EnterResponse } from '@/shared/api/http/types/partyrooms';

export function useEnterPartyroom() {
  const updateMyPartyroomInfo = useCurrentPartyroom((state) => state.updateMe);

  return useMutation<EnterResponse, AxiosError<APIError>, EnterPayload>({
    mutationFn: PartyroomsService.enter,
    onSuccess: (res) => {
      updateMyPartyroomInfo({
        memberId: res.memberId,
        gradeType: res.gradeType,
        host: res.host,
      });
    },
  });
}
