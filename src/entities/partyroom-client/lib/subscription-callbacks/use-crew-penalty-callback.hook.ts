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
  const [updateChatMessage, alert] = useCurrentPartyroom((state) => [
    state.updateChatMessage,
    state.alert,
  ]);

  return (event: CrewPenaltyEvent) => {
    if (event.penaltyType === PenaltyType.CHAT_MESSAGE_REMOVAL) {
      const crews = useCurrentPartyroom.getState().crews;

      const punisher = crews.find((crew) => crew.crewId === event.punisher.crewId);
      const punished = crews.find((crew) => crew.crewId === event.punished.crewId);

      if (!punisher || !punished) {
        errorLogger('Punisher and Punished not found');
        return;
      }

      updateChatMessage(
        (message) => message.from === 'user' && message.message.messageId === event.detail,
        () => ({
          from: 'system',
          content: `'${punisher?.nickname}'(이)가 '${punished?.nickname}'의 채팅을 삭제했습니다.`, // TODO: i18n 적용
          messageId: event.detail,
          receivedAt: Date.now(),
        })
      );

      return;
    }

    const myCrewId = useCurrentPartyroom.getState().me?.crewId;
    if (myCrewId === event.punished.crewId) {
      alert.trigger({
        type: event.penaltyType,
        reason: event.detail,
      });
    }
  };
}
