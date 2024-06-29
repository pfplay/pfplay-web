import { GetMyInfoResponse, GetMyProfileSummaryResponse } from '@/shared/api/types/users';

export type Model = GetMyInfoResponse & GetMyProfileSummaryResponse;

export const serviceEntry = (model: Model | null): string => {
  if (!model) return '/';

  if (!model.profileUpdated) {
    return '/settings/profile';
  }

  return '/parties';
};

export const scoreSum = (model: Model): string => {
  const sum = model.activitySummaries.reduce((acc, { score }) => acc + score, 0);

  return `${sum}p`;
};

export const registrationDate = (model: Model): string => {
  return model.registrationDate.replace(/-/g, '.');
};
