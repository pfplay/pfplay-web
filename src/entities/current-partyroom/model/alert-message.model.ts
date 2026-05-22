import { GradeType, PenaltyType } from '@/shared/api/http/types/@enums';

export type Model = PenaltyAlertMessage | GradeAdjustedAlertMessage | DjRemovedAlertMessage;

type PenaltyAlertMessage = {
  type: Exclude<PenaltyType, PenaltyType.CHAT_MESSAGE_REMOVAL>;
  reason: string;
};

type GradeAdjustedAlertMessage = {
  type: 'grade-adjusted';
  prev: GradeType;
  next: GradeType;
};

type DjRemovedAlertMessage =
  | { type: 'dj-deactivated'; playbackTimeLimitMinutes: number | null }
  | { type: 'dj-admin-removed' };

export const isPenaltyAlertMessage = (message: Model): message is PenaltyAlertMessage => {
  return Object.values(PenaltyType).includes(message.type as PenaltyType);
};

export const isGradeAdjustedAlertMessage = (
  message: Model
): message is GradeAdjustedAlertMessage => {
  return message.type === 'grade-adjusted';
};

export const isDjRemovedAlertMessage = (message: Model): message is DjRemovedAlertMessage =>
  message.type === 'dj-deactivated' || message.type === 'dj-admin-removed';
