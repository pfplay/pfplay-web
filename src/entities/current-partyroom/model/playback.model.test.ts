import { ONE_MINUTE } from '@/shared/config/time';
import * as Playback from './playback.model';

describe('playback model', () => {
  describe('getInitialSeek', () => {
    const MOCK_CURRENT_DATE = new Date('2000-01-01T23:55:00Z');

    beforeAll(() => {
      jest.useFakeTimers().setSystemTime(MOCK_CURRENT_DATE);
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    test('should return seek amount in seconds when endTime is in today', () => {
      const model: Partial<Playback.Model> = {
        duration: '02:00',
        endTime: MOCK_CURRENT_DATE.getTime() + ONE_MINUTE,
      };

      const result = Playback.getInitialSeek(model as Playback.Model);

      expect(result).toBe(ONE_MINUTE / 1000);
    });

    test('should return seek amount in seconds when endTime is in tomorrow', () => {
      const model: Partial<Playback.Model> = {
        duration: '10:00',
        endTime: MOCK_CURRENT_DATE.getTime() + ONE_MINUTE * 7,
      };

      const result = Playback.getInitialSeek(model as Playback.Model);

      expect(result).toBe((ONE_MINUTE * 3) / 1000);
    });

    test('재생 시작 직후 (seek ≈ 0)', () => {
      const model: Partial<Playback.Model> = {
        duration: '03:00',
        endTime: MOCK_CURRENT_DATE.getTime() + 3 * ONE_MINUTE,
      };

      const result = Playback.getInitialSeek(model as Playback.Model);

      expect(result).toBe(0);
    });

    test('거의 끝남 (seek ≈ duration)', () => {
      const model: Partial<Playback.Model> = {
        duration: '03:00',
        endTime: MOCK_CURRENT_DATE.getTime() + 1000,
      };

      const result = Playback.getInitialSeek(model as Playback.Model);

      expect(result).toBe(179);
    });

    test('endTime 과거 → 음수 방지 (max 0)', () => {
      const model: Partial<Playback.Model> = {
        duration: '00:10',
        endTime: MOCK_CURRENT_DATE.getTime() - ONE_MINUTE,
      };

      const result = Playback.getInitialSeek(model as Playback.Model);

      expect(result).toBeGreaterThanOrEqual(0);
    });

    test('duration "00:30" → 30초 기준 계산', () => {
      const model: Partial<Playback.Model> = {
        duration: '00:30',
        endTime: MOCK_CURRENT_DATE.getTime() + 10 * 1000,
      };

      const result = Playback.getInitialSeek(model as Playback.Model);

      expect(result).toBe(20);
    });

    test('duration "05:00" → 300초 기준 계산', () => {
      const model: Partial<Playback.Model> = {
        duration: '05:00',
        endTime: MOCK_CURRENT_DATE.getTime() + ONE_MINUTE,
      };

      const result = Playback.getInitialSeek(model as Playback.Model);

      expect(result).toBe(240);
    });
  });
});
