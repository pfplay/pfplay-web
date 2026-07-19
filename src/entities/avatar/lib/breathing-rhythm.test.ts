import breathingRhythm, { BREATH_PERIOD_MAX, BREATH_PERIOD_MIN } from './breathing-rhythm';

/** 값을 4등분 구간에 담아 쏠림을 본다. 한 구간이라도 비면 그만큼 같은 박자가 겹친다. */
const bucketize = (ids: number[], pick: (id: number) => number) => {
  const buckets = [0, 0, 0, 0];
  ids.forEach((id) => buckets[Math.min(3, Math.floor(pick(id) * 4))]++);
  return buckets;
};

const periodRatio = (id: number) =>
  (breathingRhythm(id).period - BREATH_PERIOD_MIN) / (BREATH_PERIOD_MAX - BREATH_PERIOD_MIN);
const phaseRatio = (id: number) => {
  const { period, phase } = breathingRhythm(id);
  return phase / period;
};

const range = (start: number, step = 1) => Array.from({ length: 200 }, (_, i) => start + i * step);

describe('breathingRhythm', () => {
  test('같은 id 는 항상 같은 리듬을 준다', () => {
    expect(breathingRhythm(42)).toEqual(breathingRhythm(42));
  });

  test('다른 id 는 다른 리듬을 준다', () => {
    expect(breathingRhythm(1)).not.toEqual(breathingRhythm(2));
  });

  test('주기는 설정한 범위 안에 있다', () => {
    range(0).forEach((id) => {
      const { period } = breathingRhythm(id);
      expect(period).toBeGreaterThanOrEqual(BREATH_PERIOD_MIN);
      expect(period).toBeLessThanOrEqual(BREATH_PERIOD_MAX);
    });
  });

  test('시작 위상은 자기 주기 안에 있다', () => {
    range(0).forEach((id) => {
      const { period, phase } = breathingRhythm(id);
      expect(phase).toBeGreaterThanOrEqual(0);
      expect(phase).toBeLessThan(period);
    });
  });

  // crewId 는 연속된 정수라, 옆 번호끼리 값이 비슷하면 실제 방에서 그대로 동시 호흡이 된다.
  // 실제로 겪을 만한 id 분포를 모두 확인한다.
  describe.each([
    ['연속된 작은 id', range(0)],
    ['연속된 큰 id', range(5000)],
    ['백만 단위 id', range(1_000_000)],
    ['띄엄띄엄 떨어진 id', range(0, 37)],
  ])('%s', (_label, ids) => {
    test('주기가 한쪽으로 몰리지 않는다', () => {
      bucketize(ids, periodRatio).forEach((count) => expect(count).toBeGreaterThan(20));
    });

    test('시작 위상도 한쪽으로 몰리지 않는다', () => {
      bucketize(ids, phaseRatio).forEach((count) => expect(count).toBeGreaterThan(20));
    });
  });

  test('이웃한 id 끼리 리듬이 붙어 있지 않다', () => {
    // 1번과 2번이 사실상 같은 박자면 옆에 선 두 사람이 겹쳐 보인다.
    range(0).forEach((id) => {
      expect(Math.abs(periodRatio(id) - periodRatio(id + 1))).toBeGreaterThan(0.05);
    });
  });
});
