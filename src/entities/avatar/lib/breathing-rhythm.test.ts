import breathingRhythmOf, {
  BREATH_PERIOD_MAX_SECONDS,
  BREATH_PERIOD_MIN_SECONDS,
} from './breathing-rhythm';

const periodRatioOf = (crewId: number) =>
  (breathingRhythmOf(crewId).periodSeconds - BREATH_PERIOD_MIN_SECONDS) /
  (BREATH_PERIOD_MAX_SECONDS - BREATH_PERIOD_MIN_SECONDS);

const startOffsetRatioOf = (crewId: number) => {
  const { periodSeconds, startOffsetSeconds } = breathingRhythmOf(crewId);
  return startOffsetSeconds / periodSeconds;
};

const countPerQuarter = (crewIds: number[], ratioOf: (crewId: number) => number) => {
  const quarters = [0, 0, 0, 0];
  crewIds.forEach((crewId) => quarters[Math.min(3, Math.floor(ratioOf(crewId) * 4))]++);
  return quarters;
};

const crewIds = (startId: number, step = 1) =>
  Array.from({ length: 200 }, (_, i) => startId + i * step);

describe('breathingRhythmOf', () => {
  test('같은 crewId 는 항상 같은 리듬을 준다', () => {
    expect(breathingRhythmOf(42)).toEqual(breathingRhythmOf(42));
  });

  test('다른 crewId 는 다른 리듬을 준다', () => {
    expect(breathingRhythmOf(1)).not.toEqual(breathingRhythmOf(2));
  });

  test('주기는 설정한 범위 안에 있다', () => {
    crewIds(0).forEach((crewId) => {
      const { periodSeconds } = breathingRhythmOf(crewId);
      expect(periodSeconds).toBeGreaterThanOrEqual(BREATH_PERIOD_MIN_SECONDS);
      expect(periodSeconds).toBeLessThanOrEqual(BREATH_PERIOD_MAX_SECONDS);
    });
  });

  test('시작 시점은 자기 주기 안에 있다', () => {
    crewIds(0).forEach((crewId) => {
      const { periodSeconds, startOffsetSeconds } = breathingRhythmOf(crewId);
      expect(startOffsetSeconds).toBeGreaterThanOrEqual(0);
      expect(startOffsetSeconds).toBeLessThan(periodSeconds);
    });
  });

  describe.each([
    ['연속된 작은 crewId', crewIds(0)],
    ['연속된 큰 crewId', crewIds(5000)],
    ['백만 단위 crewId', crewIds(1_000_000)],
    ['띄엄띄엄 떨어진 crewId', crewIds(0, 37)],
  ])('%s', (_label, ids) => {
    test('주기가 한쪽으로 몰리지 않는다', () => {
      countPerQuarter(ids, periodRatioOf).forEach((count) => expect(count).toBeGreaterThan(20));
    });

    test('시작 시점도 한쪽으로 몰리지 않는다', () => {
      countPerQuarter(ids, startOffsetRatioOf).forEach((count) =>
        expect(count).toBeGreaterThan(20)
      );
    });
  });

  test('이웃한 crewId 끼리 리듬이 붙어 있지 않다', () => {
    crewIds(0).forEach((crewId) => {
      expect(Math.abs(periodRatioOf(crewId) - periodRatioOf(crewId + 1))).toBeGreaterThan(0.05);
    });
  });
});
