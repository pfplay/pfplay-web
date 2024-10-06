import { PenaltyType } from '@/shared/api/http/types/@enums';
import { CrewPenaltyEvent } from '@/shared/api/websocket/types/partyroom';
import { errorLog } from '@/shared/lib/functions/log/logger';
import withDebugger from '@/shared/lib/functions/log/with-debugger';
import { useStores } from '@/shared/lib/store/stores.context';

const logger = withDebugger(0);
const errorLogger = logger(errorLog);

/**
 * WS에서 패널티 관련 event 처리하는 콜백
 */
export default function useCrewPenaltyCallback() {
  const { useCurrentPartyroom } = useStores();
  const [updateChatMessage, crews, setPenaltyNotification] = useCurrentPartyroom((state) => [
    state.updateChatMessage,
    state.crews,
    state.setPenaltyNotification,
  ]);

  return (event: CrewPenaltyEvent) => {
    if (event.penaltyType === PenaltyType.CHAT_MESSAGE_REMOVAL) {
      const punisher = crews.find((crew) => crew.crewId === event.punisher.crewId);
      const punished = crews.find((crew) => crew.crewId === event.punished.crewId);

      if (!punisher || !punished) {
        errorLogger('Punisher and Punished not found');
        return;
      }

      updateChatMessage({
        messageId: event.detail,
        content: `'${punisher?.nickname}'(이)가 '${punished?.nickname}'의 채팅을 삭제했습니다.`, // TODO: i18n 적용
      });
    } else {
      setPenaltyNotification({
        punishedId: event.punished.crewId,
        penaltyType: event.penaltyType,
        detail: event.detail,
      });
    }
  };
}
