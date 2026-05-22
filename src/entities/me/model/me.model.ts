import { ActivityType } from '@/shared/api/http/types/@enums';
import { GetMyInfoResponse, GetMyProfileSummaryResponse } from '@/shared/api/http/types/users';

export type Model = GetMyInfoResponse & GetMyProfileSummaryResponse;

export const serviceEntry = (model: Model | null, isNewUser?: boolean): string => {
  if (!model) return '/';

  // 신규 가입자는 me 데이터와 무관하게 프로필 설정 강제 (defense-in-depth).
  // zombie me(좀비: auth=GUEST + profile=신규) 의 profileUpdated=true 가
  // 가드를 통과시키는 race 를 isNewUser 안전망으로 차단한다.
  if (isNewUser || !model.profileUpdated) {
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
