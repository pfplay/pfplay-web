import { GradeType, PenaltyType } from '@/shared/api/http/types/@enums';
import {
  isPenaltyAlertMessage,
  isGradeAdjustedAlertMessage,
  isDjRemovedAlertMessage,
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

  describe('isDjRemovedAlertMessage', () => {
    test('dj-deactivated + playbackTimeLimitMinutes 숫자 → true, 다른 가드는 false', () => {
      const message: Model = { type: 'dj-deactivated', playbackTimeLimitMinutes: 5 };
      expect(isDjRemovedAlertMessage(message)).toBe(true);
      expect(isPenaltyAlertMessage(message)).toBe(false);
      expect(isGradeAdjustedAlertMessage(message)).toBe(false);
    });

    test('dj-deactivated + playbackTimeLimitMinutes null → true', () => {
      const message: Model = { type: 'dj-deactivated', playbackTimeLimitMinutes: null };
      expect(isDjRemovedAlertMessage(message)).toBe(true);
    });

    test('dj-admin-removed → true', () => {
      const message: Model = { type: 'dj-admin-removed' };
      expect(isDjRemovedAlertMessage(message)).toBe(true);
    });

    test('grade-adjusted 타입은 false', () => {
      const message: Model = {
        type: 'grade-adjusted',
        prev: GradeType.LISTENER,
        next: GradeType.CLUBBER,
      };
      expect(isDjRemovedAlertMessage(message)).toBe(false);
    });

    it.each([
      PenaltyType.CHAT_BAN_30_SECONDS,
      PenaltyType.ONE_TIME_EXPULSION,
      PenaltyType.PERMANENT_EXPULSION,
    ])('PenaltyType.%s → false', (type) => {
      const message: Model = { type, reason: '규칙 위반' };
      expect(isDjRemovedAlertMessage(message)).toBe(false);
    });
  });
});
