import { GradeType } from '@/shared/api/http/types/@enums';
import { PFHeadsetGray, PFHeadsetRed } from '@/shared/ui/icons';

type Props = {
  grade: GradeType;
};

export default function AuthorityHeadset({ grade }: Props) {
  const noHeadset =
    grade === GradeType.COMMUNITY_MANAGER ||
    grade === GradeType.LISTENER ||
    grade === GradeType.MODERATOR;

  if (noHeadset) return null;

  if (grade === GradeType.CLUBBER) {
    return <PFHeadsetGray width={40} height={23} className={commonHeadsetStyle} />;
  }

  return <PFHeadsetRed width={40} height={23} className={commonHeadsetStyle} />;
}

const commonHeadsetStyle = 'absolute -top-[1px] -left-1';
