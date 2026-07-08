import * as Crew from '@/entities/current-partyroom/model/crew.model';
import { ChatMessageSentEvent } from '@/shared/api/websocket/types/partyroom';
import { warnLog } from '@/shared/lib/functions/log/logger';
import withDebugger from '@/shared/lib/functions/log/with-debugger';
import { useStores } from '@/shared/lib/store/stores.context';

export default function useChatCallback() {
  const { useCurrentPartyroom } = useStores();
  const [appendChatMessage, updateCrews] = useCurrentPartyroom((state) => [
    state.appendChatMessage,
    state.updateCrews,
  ]);

  return (event: ChatMessageSentEvent) => {
    const { crews } = useCurrentPartyroom.getState();

    const crew = crews.find((crew) => crew.crewId === event.crew.crewId);
    if (!crew) {
      logCrewNotFound(event.crew.crewId, crews);
      return;
    }

    appendChatMessage({
      from: 'user',
      crew,
      message: event.message,
      receivedAt: Date.now(),
    });

    // #410: 발신 crew 아바타 위에 말풍선을 띄우기 위한 트리거. lastChatAt 갱신 시
    // Avatar 가 transient 로 말풍선을 노출한다(연속 채팅이면 값이 갱신돼 시간 연장).
    updateCrews((prev) =>
      prev.map((prevCrew) =>
        prevCrew.crewId === crew.crewId ? { ...prevCrew, lastChatAt: Date.now() } : prevCrew
      )
    );
  };
}

const logger = withDebugger(0);
const warnLogger = logger(warnLog);

function logCrewNotFound(crewId: number, currentCrews: Crew.Model[]) {
  warnLogger(
    `Cannot find crew(crewId: ${crewId}) in stored crews for chat. current crews: ${JSON.stringify(
      currentCrews,
      null,
      2
    )}`
  );
}
