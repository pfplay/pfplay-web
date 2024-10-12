import { PenaltyType } from '@/shared/api/http/types/@enums';
import Observer from '@/shared/lib/functions/observer';

export type AlertMessage =
  | {
      type: PenaltyType.CHAT_BAN_30_SECONDS;
      reason: string;
    }
  | {
      type: PenaltyType.ONE_TIME_EXPULSION;
      reason: string;
    }
  | {
      type: PenaltyType.PERMANENT_EXPULSION;
      reason: string;
    };

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
