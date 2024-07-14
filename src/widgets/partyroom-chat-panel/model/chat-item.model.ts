import { PartyroomGrade } from '@/shared/api/http/types/@enums';

export const checkHigherGrade = (authority?: PartyroomGrade) => {
  if (!authority) return false;
  return (
    authority === PartyroomGrade.MOD ||
    authority === PartyroomGrade.CM ||
    authority === PartyroomGrade.ADMIN
  );
};
