import { ActivityType } from '@/shared/api/types/@enums';
import { GetMyInfoResponse, GetMyProfileSummaryResponse } from '@/shared/api/types/users';

export type Model = GetMyInfoResponse & GetMyProfileSummaryResponse;

export const serviceEntry = (model: Model | null): string => {
  if (!model) return '/';

  if (!model.profileUpdated) {
    return '/settings/profile';
  }

  return '/parties';
};

export const score = (model: Model, activityType: ActivityType): number => {
  const summary = model.activitySummaries.find((summary) => summary.activityType === activityType);

  return summary ? summary.score : 0;
};

export const registrationDate = (model: Model): string => {
  return model.registrationDate.replace(/-/g, '.');
};
