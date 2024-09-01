import { GradeType } from '@/shared/api/http/types/@enums';

export const GRADE_TYPE_LABEL: Record<GradeType, string> = {
  [GradeType.HOST]: 'Admin',
  [GradeType.COMMUNITY_MANAGER]: 'Community Manager',
  [GradeType.MODERATOR]: 'Moderator',
  [GradeType.CLUBBER]: 'Clubber',
  [GradeType.LISTENER]: 'Listener',
};
