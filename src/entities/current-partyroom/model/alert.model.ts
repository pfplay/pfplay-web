import { GradeType, PenaltyType } from '@/shared/api/http/types/@enums';
import Observer from '@/shared/lib/functions/observer';

export default class Alert {
  private observer = new Observer<AlertMessage>();

  public subscribe(listener: (message: AlertMessage) => void) {
    this.observer.subscribe(listener);
  }

  public unsubscribe(listener: (message: AlertMessage) => void) {
    this.observer.unsubscribe(listener);
  }

  public trigger(message: AlertMessage) {
    this.observer.notify(message);
  }
}

type PenaltyAlertMessage = {
  type: Exclude<PenaltyType, PenaltyType.CHAT_MESSAGE_REMOVAL>;
  reason: string;
};

type GradeAdjustedAlertMessage = {
  type: 'grade-adjusted';
  prev: GradeType;
  next: GradeType;
};

export type AlertMessage = PenaltyAlertMessage | GradeAdjustedAlertMessage;

export const isPenaltyAlertMessage = (message: AlertMessage): message is PenaltyAlertMessage => {
  return Object.values(PenaltyType).includes(message.type as PenaltyType);
};

export const isGradeAdjustedAlertMessage = (
  message: AlertMessage
): message is GradeAdjustedAlertMessage => {
  return message.type === 'grade-adjusted';
};
