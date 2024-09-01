import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { QueryKeys } from '@/shared/api/http/query-keys';
import PartyroomsService from '@/shared/api/http/services/partyrooms';
import { APIError } from '@/shared/api/http/types/@shared';
import { AdjustGradePayload } from '@/shared/api/http/types/partyrooms';

export function useAdjustGrade() {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError<APIError>, AdjustGradePayload>({
    mutationFn: PartyroomsService.adjustGrade,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.Members],
      });
    },
  });
}
