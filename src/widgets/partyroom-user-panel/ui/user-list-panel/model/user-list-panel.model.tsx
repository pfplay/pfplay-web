import { GradeType } from '@/shared/api/http/types/@enums';
import { Participant } from '@/shared/api/http/types/partyroom';
import { categorize } from '@/shared/lib/functions/categorize';

const GRADE_TYPE_ORDER = [
  GradeType.HOST,
  GradeType.COMMUNITY_MANAGER,
  GradeType.MODERATOR,
  GradeType.CLUBBER,
  GradeType.LISTENER,
];

export const categorizeParticipantsByGrade = (participants: Participant[]) => {
  return categorize({
    items: participants,
    categoryKey: 'gradeType',
    getCategoryValue: (participant) => participant.gradeType,
    orderReferenceArr: GRADE_TYPE_ORDER,
  });
};
