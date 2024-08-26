import { useHandlePartyroomSubscriptionEvent } from '@/entities/current-partyroom';
import { usePartyroomClient } from '@/entities/partyroom-client';
import PartyroomsService from '@/shared/api/http/services/partyrooms';
import { errorLog } from '@/shared/lib/functions/log/logger';
import withDebugger from '@/shared/lib/functions/log/with-debugger';
import { useStores } from '@/shared/lib/store/stores.context';
import { useDialog } from '@/shared/ui/components/dialog';
import { useEnterPartyroom as useEnterPartyroomMutation } from '../api/use-enter-partyroom.mutation';

const logger = withDebugger(0);
const errorLogger = logger(errorLog);

export function useEnterPartyroom(partyroomId: number) {
  const { openErrorDialog } = useDialog();
  const client = usePartyroomClient();
  const handleEvent = useHandlePartyroomSubscriptionEvent();
  const { useCurrentPartyroom } = useStores();
  const initPartyroom = useCurrentPartyroom((state) => state.init);
  const { mutateAsync: enterAsync } = useEnterPartyroomMutation();

  const enter = async () => {
    try {
      const enterResponse = await enterAsync({ partyroomId });
      const setUpInfo = await PartyroomsService.getSetupInfo({ partyroomId });

      // TODO: members 작업 시 members 캐시 데이터 세팅해주기
      // queryClient.setQueryData([QueryKeys.PartyroomMembers, partyroomId], setUpInfo.members);

      /**
       * 공지사항은 현재 설계상 enter 시점엔 rest api로 받아오고,
       * 이후 공지 변경이 있을 땐 웹 소켓 이벤트로 수신합니다.
       * 때문에 rest api에 대해선 useQuery를 사용하지 않고 fetchQuery를 사용하여, enter 시점 최초 1회만 호출합니다.
       * 다만 notice fetch가 중요도가 그리 높지 않은데 블락으로 적용하는게 좋아보이진 않아, 이후에 뷰 레이어로 옮기는게 좋아보입니다.
       */
      const notice = await PartyroomsService.getNotice({ partyroomId });

      initPartyroom({
        id: partyroomId,
        me: {
          memberId: enterResponse.memberId,
          gradeType: enterResponse.gradeType,
        },
        playbackActivated: setUpInfo.display.playbackActivated,
        playback: setUpInfo.display.playback,
        reaction: setUpInfo.display.reaction,
        members: setUpInfo.members,
        currentDj: setUpInfo.display.currentDj,
        notice: notice.content ?? '',
      });

      client.subscribe(partyroomId, handleEvent);
    } catch (e) {
      errorLogger(e);
      openErrorDialog('Oops! Something went wrong. Please try again later.');
    }
  };

  return () => {
    client.whenConnected(enter);
  };
}
