import { GradeType } from '@/shared/api/http/types/@enums';

export const GRADE_TYPE_LABEL: Record<GradeType, string> = {
  [GradeType.HOST]: 'Admin',
  [GradeType.COMMUNITY_MANAGER]: 'CM',
  [GradeType.MODERATOR]: 'Mod',
  [GradeType.CLUBBER]: 'Clubber',
  [GradeType.LISTENER]: 'Listener',
};
