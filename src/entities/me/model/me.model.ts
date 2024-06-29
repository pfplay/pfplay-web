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

const getActivityPoint = (model: Model, activityType: ActivityType): string => {
  const summary = model.activitySummaries.find((summary) => summary.activityType === activityType);
  const point = summary ? summary.score : 0;
  return `${point}p`;
};

export const djScore = (model: Model): string => {
  return getActivityPoint(model, ActivityType.DJ_PNT);
};

export const registrationDate = (model: Model): string => {
  return model.registrationDate.replace(/-/g, '.');
};
