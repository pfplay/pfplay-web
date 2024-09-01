import { GradeType } from '@/shared/api/http/types/@enums';
import { PFHeadsetGray, PFHeadsetRed } from '@/shared/ui/icons';

type Props = {
  grade: GradeType;
};

export default function AuthorityHeadset({ grade }: Props) {
  if (grade === GradeType.LISTENER) return null;

  if (grade === GradeType.CLUBBER) {
    return <PFHeadsetGray width={42} height={25} className={commonHeadsetStyle} />;
  }

  return <PFHeadsetRed width={42} height={25} className={commonHeadsetStyle} />;
}

const commonHeadsetStyle = 'absolute -top-[2px] -left-[5px]';
