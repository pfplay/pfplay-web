import { PenaltyType } from '@/shared/api/http/types/@enums';
import { CrewPenalizedEvent } from '@/shared/api/websocket/types/partyroom';
import { errorLog } from '@/shared/lib/functions/log/logger';
import withDebugger from '@/shared/lib/functions/log/with-debugger';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { processI18nString } from '@/shared/lib/localization/renderer/processors/variable-processor-util';
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
  const t = useI18n();

  return (event: CrewPenalizedEvent) => {
    if (event.penaltyType === PenaltyType.CHAT_MESSAGE_REMOVAL) {
      const crews = useCurrentPartyroom.getState().crews;

      const punisher = crews.find((crew) => crew.crewId === event.punisher.crewId);
      const punished = crews.find((crew) => crew.crewId === event.punished.crewId);

      if (!punisher || !punished) {
        errorLogger('Punisher or Punished not found');
        return;
      }

      updateChatMessage(
        (message) => message.from === 'user' && message.message.messageId === event.detail,
        () => ({
          from: 'system',
          content: processI18nString(t.chat.para.remove_chat, {
            subject: punisher?.nickname ?? '',
            target: punished?.nickname ?? '',
          }),
          messageId: event.detail,
          receivedAt: Date.now(),
        })
      );

      return;
    }

    const myCrewId = useCurrentPartyroom.getState().me?.crewId;
    if (myCrewId === event.punished.crewId) {
      alert.notify({
        type: event.penaltyType,
        reason: event.detail,
      });
    }
  };
}
