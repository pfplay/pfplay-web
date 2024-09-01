import { PartyroomMember } from '@/shared/api/http/types/partyrooms';

export type Model = {
  member: PartyroomMember;
  content: string;
  receivedAt: number;
};

export const uniqueId = (model: Model) => {
  return model.member.memberId + model.member.uid + model.receivedAt;
};
