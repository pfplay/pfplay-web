import { GradeType, PenaltyType } from '@/shared/api/http/types/@enums';

export type Model = PenaltyAlertMessage | GradeAdjustedAlertMessage;

type PenaltyAlertMessage = {
  type: Exclude<PenaltyType, PenaltyType.CHAT_MESSAGE_REMOVAL>;
  reason: string;
};

type GradeAdjustedAlertMessage = {
  type: 'grade-adjusted';
  prev: GradeType;
  next: GradeType;
};

export const isPenaltyAlertMessage = (message: Model): message is PenaltyAlertMessage => {
  return Object.values(PenaltyType).includes(message.type as PenaltyType);
};

export const isGradeAdjustedAlertMessage = (
  message: Model
): message is GradeAdjustedAlertMessage => {
  return message.type === 'grade-adjusted';
};
