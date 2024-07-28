import { GradeType } from '@/shared/api/http/types/@enums';
import { Participant } from '@/shared/api/http/types/partyroom';

const gradeTypeArray = Object.values(GradeType);

export const categorizeParticipantsByGrade = (participants: Participant[]) => {
  return gradeTypeArray.reduce((acc, grade) => {
    acc[grade] = participants.filter((participant) => participant.gradeType === grade);
    return acc;
  }, {} as Record<GradeType, Participant[]>);
};
