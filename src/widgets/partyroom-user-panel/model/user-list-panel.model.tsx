import { GradeType } from '@/shared/api/http/types/@enums';
import { Participant } from '@/shared/api/http/types/partyroom';
import { categorize, Categorized } from '@/shared/lib/functions/categorize';

const GRADE_TYPE_ORDER = [
  GradeType.HOST,
  GradeType.COMMUNITY_MANAGER,
  GradeType.MODERATOR,
  GradeType.CLUBBER,
  GradeType.LISTENER,
];

type EnhancedParticipant =
  CategorizeParticipantsByGrade[keyof CategorizeParticipantsByGrade][number];
export type CategorizeParticipantsByGrade = Categorized<
  Participant & {
    isMe: boolean;
    isDjing: boolean;
  }
>;

export const categorizeParticipantsByGrade = ({
  participants,
  meId,
  djId,
}: {
  participants: Participant[];
  meId?: number;
  djId?: number;
}): CategorizeParticipantsByGrade => {
  const categorized = categorize({
    items: participants,
    categoryKey: 'gradeType',
    getCategoryValue: (participant) => participant.gradeType,
    orderReferenceArr: GRADE_TYPE_ORDER,
  });

  Object.values(categorized).forEach((category) => {
    category.forEach((participant) => {
      (participant as EnhancedParticipant).isMe = participant.memberId === meId ? true : false;
      (participant as EnhancedParticipant).isDjing = participant.memberId === djId ? true : false;
    });
  });

  return categorized as CategorizeParticipantsByGrade;
};
