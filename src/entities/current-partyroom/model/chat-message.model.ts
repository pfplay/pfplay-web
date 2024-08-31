import { GradeType } from '@/shared/api/http/types/@enums';
import { PartyroomMember } from '@/shared/api/http/types/partyrooms';

export type Model = {
  member: PartyroomMember;
  content: string;
  receivedAt: number;
};

export const checkHigherGrade = (model: Model) => {
  const gradeType = model.member.gradeType;

  return (
    gradeType === GradeType.MODERATOR ||
    gradeType === GradeType.COMMUNITY_MANAGER ||
    gradeType === GradeType.HOST
  );
};

export const uniqueId = (model: Model) => {
  return model.member.memberId + model.member.uid + model.receivedAt;
};
