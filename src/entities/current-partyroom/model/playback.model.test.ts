import * as Playback from './playback.model';

describe('playback model', () => {
  describe('getInitialSeek', () => {
    beforeAll(() => {
      jest.useFakeTimers().setSystemTime(new Date('2000-01-01T23:55:00Z'));
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    test('should return seek amount in seconds when endTime is in today', () => {
      const model: Partial<Playback.Model> = {
        duration: '02:00',
        endTime: '23:56:00',
      };

      const result = Playback.getInitialSeek(model as Playback.Model);

      expect(result).toBe(60);
    });

    test('should return seek amount in seconds when endTime is in tomorrow', () => {
      const model: Partial<Playback.Model> = {
        duration: '10:00',
        endTime: '00:02:00',
      };

      const result = Playback.getInitialSeek(model as Playback.Model);

      expect(result).toBe(180);
    });
  });
});
