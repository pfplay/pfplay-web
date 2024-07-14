import { PartyroomGrade } from '@/shared/api/http/types/@enums';
import { cn } from '@/shared/lib/functions/cn';
import { PFHeadsetGray, PFHeadsetRed } from '@/shared/ui/icons';

interface Props {
  authority?: PartyroomGrade;
  className?: string;
}
const AuthorityHeadset = ({ authority, className }: Props) => {
  const noHeadset =
    !authority ||
    authority === PartyroomGrade.CM ||
    authority === PartyroomGrade.LISTENER ||
    authority === PartyroomGrade.MOD;

  if (noHeadset) return null;

  if (authority === PartyroomGrade.CLUBBER) {
    return <PFHeadsetGray width={40} height={23} className={cn(commonHeadsetStyle, className)} />;
  }

  return <PFHeadsetRed width={40} height={23} className={cn(commonHeadsetStyle, className)} />;
};

export default AuthorityHeadset;

const commonHeadsetStyle = 'absolute -top-[1px] -left-1';
