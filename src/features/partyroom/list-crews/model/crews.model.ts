import { Crew } from '@/entities/current-partyroom';
import { categorize, Categorized } from '@/shared/lib/functions/categorize';

export const categorizeByGradeType = (crews: Crew.Model[]): Categorized<Crew.Model> => {
  return categorize({
    items: crews,
    categoryKey: 'gradeType',
    orderReferenceArr: Crew.gradePriorities as string[],
  });
};
