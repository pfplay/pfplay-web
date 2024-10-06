import { PartyroomCrew } from '@/shared/api/http/types/partyrooms';
import { ChatEvent } from '@/shared/api/websocket/types/partyroom';

export type Model = {
  crew: PartyroomCrew;
  message: ChatEvent['message'];
  receivedAt: number;
};

export const uniqueId = (model: Model) => {
  return model.crew.crewId + model.crew.uid + model.receivedAt;
};
