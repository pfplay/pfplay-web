import { Crew } from '@/entities/current-partyroom';
import { Participant } from '@/shared/api/http/types/partyrooms';
import { categorize, Categorized } from '@/shared/lib/functions/categorize';

export type CategorizeParticipantsByGrade = Categorized<Participant>;

export const categorizeParticipantsByGrade = ({
  participants,
}: {
  participants: Participant[];
}): CategorizeParticipantsByGrade => {
  // TODO:추후 api에서 카테고리화 된 데이터 불러오면 변경. 논의 쓰레드: https://pfplay.slack.com/archives/C051N8A0ZSB/p1722750263738659?thread_ts=1722050726.960859&cid=C051N8A0ZSB
  const categorized = categorize({
    items: participants,
    categoryKey: 'gradeType',
    getCategoryValue: (participant) => participant.gradeType,
    orderReferenceArr: Crew.gradePriorities as string[],
  });

  return categorized as CategorizeParticipantsByGrade;
};
