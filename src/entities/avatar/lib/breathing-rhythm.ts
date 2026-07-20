export const BREATH_PERIOD_MIN_SECONDS = 1.05;
export const BREATH_PERIOD_MAX_SECONDS = 1.75;

const GOLDEN_RATIO_CONJUGATE = 0.618033988749895;
const PLASTIC_NUMBER_CONJUGATE = 0.754877666246693;

/** 무리수를 곱한 소수부는 연속된 정수를 고르게 흩는다. crewId 가 1, 2, 3… 으로 이어지므로 이 성질이 없으면 옆 번호끼리 리듬이 붙는다. */
const evenlySpreadRatio = (crewId: number, irrational: number) => {
  const scaled = crewId * irrational;
  return scaled - Math.floor(scaled);
};

export type BreathingRhythm = {
  periodSeconds: number;
  startOffsetSeconds: number;
};

/** 아바타가 저마다 다른 박자로 숨쉬게 한다. 같은 crewId 는 항상 같은 리듬이라 입퇴장이나 리렌더에도 리듬이 바뀌지 않는다. */
const breathingRhythmOf = (crewId: number): BreathingRhythm => {
  const periodSeconds =
    BREATH_PERIOD_MIN_SECONDS +
    evenlySpreadRatio(crewId, GOLDEN_RATIO_CONJUGATE) *
      (BREATH_PERIOD_MAX_SECONDS - BREATH_PERIOD_MIN_SECONDS);

  return {
    periodSeconds,
    startOffsetSeconds: evenlySpreadRatio(crewId, PLASTIC_NUMBER_CONJUGATE) * periodSeconds,
  };
};

export default breathingRhythmOf;
