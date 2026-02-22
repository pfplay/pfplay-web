import { GradeType, PenaltyType } from '@/shared/api/http/types/@enums';
import {
  isPenaltyAlertMessage,
  isGradeAdjustedAlertMessage,
  type Model,
} from './alert-message.model';

describe('alert-message model', () => {
  describe('isPenaltyAlertMessage', () => {
    it.each([
      PenaltyType.CHAT_BAN_30_SECONDS,
      PenaltyType.ONE_TIME_EXPULSION,
      PenaltyType.PERMANENT_EXPULSION,
    ])('PenaltyType.%s → true', (type) => {
      const message: Model = { type, reason: '규칙 위반' };
      expect(isPenaltyAlertMessage(message)).toBe(true);
    });

    test('grade-adjusted 타입은 false', () => {
      const message: Model = {
        type: 'grade-adjusted',
        prev: GradeType.LISTENER,
        next: GradeType.CLUBBER,
      };
      expect(isPenaltyAlertMessage(message)).toBe(false);
    });
  });

  describe('isGradeAdjustedAlertMessage', () => {
    test('grade-adjusted 타입은 true', () => {
      const message: Model = {
        type: 'grade-adjusted',
        prev: GradeType.LISTENER,
        next: GradeType.MODERATOR,
      };
      expect(isGradeAdjustedAlertMessage(message)).toBe(true);
    });

    it.each([
      PenaltyType.CHAT_BAN_30_SECONDS,
      PenaltyType.ONE_TIME_EXPULSION,
      PenaltyType.PERMANENT_EXPULSION,
    ])('PenaltyType.%s → false', (type) => {
      const message: Model = { type, reason: '규칙 위반' };
      expect(isGradeAdjustedAlertMessage(message)).toBe(false);
    });
  });
});
