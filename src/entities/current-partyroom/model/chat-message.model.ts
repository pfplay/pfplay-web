import { PartyroomCrew } from '@/shared/api/http/types/partyrooms';

export type Model = {
  crew: PartyroomCrew;
  content: string;
  receivedAt: number;
};

export const uniqueId = (model: Model) => {
  return model.crew.crewId + model.crew.uid + model.receivedAt;
};
