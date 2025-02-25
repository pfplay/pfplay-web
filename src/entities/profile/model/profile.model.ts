import { ActivityType } from '@/shared/api/http/types/@enums';
import { ActivitySummary } from '@/shared/api/http/types/users';

export type Model = {
  avatarBodyUri: string;
  avatarFaceUri: string;
  combinePositionX: number;
  combinePositionY: number;
  nickname: string;
  introduction: string;
  score: number;
  registrationDate: string;
};

export const score = (activitySummaries: ActivitySummary[], activityType: ActivityType): number => {
  const summary = activitySummaries.find((summary) => summary.activityType === activityType);

  return summary ? summary.score : 0;
};

export const registrationDate = (registrationDate: string): string => {
  return registrationDate.replace(/-/g, '.');
};
