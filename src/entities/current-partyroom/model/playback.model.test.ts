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
  });
});
