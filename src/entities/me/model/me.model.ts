import { GetMyInfoResponse, GetMyProfileSummaryResponse } from '@/shared/api/http/types/users';

export type Model = GetMyInfoResponse & GetMyProfileSummaryResponse;

export const serviceEntry = (model: Model | null): string => {
  if (!model) return '/';

  if (!model.profileUpdated) {
    return '/settings/profile';
  }

  return '/parties';
};
