import { ChatMessage } from '@/entities/current-partyroom';
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
  const [updateChatMessage, setPenaltyNotification] = useCurrentPartyroom((state) => [
    state.updateChatMessage,
    state.setPenaltyNotification,
  ]);

  return (event: CrewPenaltyEvent) => {
    // crews를 훅 내부에서 직접 가져오면 초기 상태(빈 배열)가 클로저에 캡처됨.
    // 콜백 함수 내에서 crews를 가져오면 실행 시점의 최신 상태를 얻을 수 있음.
    const crews = useCurrentPartyroom.getState().crews;

    if (event.penaltyType === PenaltyType.CHAT_MESSAGE_REMOVAL) {
      const punisher = crews.find((crew) => crew.crewId === event.punisher.crewId);
      const punished = crews.find((crew) => crew.crewId === event.punished.crewId);

      if (!punisher || !punished) {
        errorLogger('Punisher and Punished not found');
        return;
      }

      updateChatMessage(
        (message: ChatMessage.Model) =>
          message.from === 'user' && message.message.messageId === event.detail,
        () => ({
          from: 'system',
          content: `'${punisher?.nickname}'(이)가 '${punished?.nickname}'의 채팅을 삭제했습니다.`, // TODO: i18n 적용
          messageId: event.detail,
        })
      );
    } else {
      setPenaltyNotification({
        punishedId: event.punished.crewId,
        penaltyType: event.penaltyType,
        detail: event.detail,
      });
    }
  };
}
