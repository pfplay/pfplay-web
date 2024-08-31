import { GradeType } from '@/shared/api/http/types/@enums';
import { PartyroomMember } from '@/shared/api/http/types/partyrooms';

export type Model = {
  by: PartyroomMember;
  content: string;
  receivedAt: number;
};

export const checkHigherGrade = (model: Model) => {
  const gradeType = model.by.gradeType;

  return (
    gradeType === GradeType.MODERATOR ||
    gradeType === GradeType.COMMUNITY_MANAGER ||
    gradeType === GradeType.HOST
  );
};

export const uniqueId = (model: Model) => {
  return model.by.memberId + model.by.uid + model.receivedAt;
};
