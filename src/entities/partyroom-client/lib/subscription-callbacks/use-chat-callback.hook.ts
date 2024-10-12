import * as Crew from '@/entities/current-partyroom/model/crew.model';
import { ChatEvent } from '@/shared/api/websocket/types/partyroom';
import { warnLog } from '@/shared/lib/functions/log/logger';
import withDebugger from '@/shared/lib/functions/log/with-debugger';
import { useStores } from '@/shared/lib/store/stores.context';

export default function useChatCallback() {
  const { useCurrentPartyroom } = useStores();
  const appendChatMessage = useCurrentPartyroom((state) => state.appendChatMessage);

  return (event: ChatEvent) => {
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
