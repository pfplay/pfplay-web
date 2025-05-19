import { ActivityType } from '@/shared/api/http/types/@enums';
import { ActivitySummary } from '@/shared/api/http/types/users';

export const extractScore = (
  activitySummaries: ActivitySummary[],
  activityType: ActivityType
): number => {
  const summary = activitySummaries.find((summary) => summary.activityType === activityType);

  return summary ? summary.score : 0;
};

export const getRegistrationDate = (registrationDate: string): string => {
  return registrationDate.replace(/-/g, '.');
};
