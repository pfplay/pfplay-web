import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import {
  fetchPartyroomSetUpInfo,
  getPartyroomDestination,
  handlePartyroomSubscriptionEvent,
  useCurrentPartyroom,
} from '@/entities/current-partyroom';
import { usePartyroomClient } from '@/entities/partyroom-client';
import PartyroomsService from '@/shared/api/http/services/partyrooms';
import { APIError } from '@/shared/api/http/types/@shared';
import { EnterPayload, EnterResponse } from '@/shared/api/http/types/partyrooms';
import { errorLog } from '@/shared/lib/functions/log/logger';
import withDebugger from '@/shared/lib/functions/log/with-debugger';
import { useDialog } from '@/shared/ui/components/dialog';

export function useEnterPartyroom() {
  const initPartyroom = useCurrentPartyroom((state) => state.init);
  const { openErrorDialog } = useDialog();
  const client = usePartyroomClient();

  const handleSuccess = (enterResponse: EnterResponse, { partyroomId }: EnterPayload) => {
    fetchPartyroomSetUpInfo(partyroomId, {
      onSuccess: (setUpInfo) => {
        // TODO: members 작업 시 members 캐시 데이터 세팅해주기
        // queryClient.setQueryData([QueryKeys.PartyroomMembers, partyroomId], setUpInfo.members);

        initPartyroom({
          id: partyroomId,
          me: {
            memberId: enterResponse.memberId,
            gradeType: enterResponse.gradeType,
            host: enterResponse.host,
          },
          playbackActivated: setUpInfo.display.playbackActivated,
          playback: setUpInfo.display.playback,
          reaction: setUpInfo.display.reaction,
        });

        client.subscribe(getPartyroomDestination(partyroomId), handlePartyroomSubscriptionEvent);
      },
      onError: (error) => {
        errorLogger(error);
        openErrorDialog('Oops! Something went wrong. Please try again later.');
      },
    });
  };

  return useMutation<EnterResponse, AxiosError<APIError>, EnterPayload>({
    mutationFn: PartyroomsService.enter,
    onSuccess: handleSuccess,
  });
}

const logger = withDebugger(0);
const errorLogger = logger(errorLog);
