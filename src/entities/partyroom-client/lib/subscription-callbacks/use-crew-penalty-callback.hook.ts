import { PenaltyType } from '@/shared/api/http/types/@enums';
import { CrewPenaltyEvent } from '@/shared/api/websocket/types/partyroom';
import { useStores } from '@/shared/lib/store/stores.context';

export default function useCrewPenaltyCallback() {
  const { useCurrentPartyroom } = useStores();
  const [updateChatMessage, crews] = useCurrentPartyroom((state) => [
    state.updateChatMessage,
    state.crews,
  ]);

  return (event: CrewPenaltyEvent) => {
    switch (event.penaltyType) {
      case PenaltyType.CHAT_MESSAGE_REMOVAL:
        const punisher = crews.find((crew) => crew.crewId === event.punisher.crewId);
        const punished = crews.find((crew) => crew.crewId === event.punished.crewId);

        updateChatMessage({
          messageId: event.detail,
          content: `'${punisher?.nickname}'(이)가 '${punished?.nickname}'의 채팅을 삭제했습니다.`, // TODO: i18n 적용
        });
        break;

      case PenaltyType.CHAT_BAN_30_SECONDS:
        break;
    }
  };
}
