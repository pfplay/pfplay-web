/** 가장 빠르게 숨쉬는 아바타의 주기. 이보다 짧으면 호흡보다 떨림으로 보인다. */
export const BREATH_PERIOD_MIN_SECONDS = 1.05;
/** 가장 느리게 숨쉬는 아바타의 주기. 이보다 길면 멈춘 것처럼 늘어져 보인다. */
export const BREATH_PERIOD_MAX_SECONDS = 1.75;

/** 주기를 흩는 데 쓰는 무리수. 연속 정수를 가장 고르게 퍼뜨리는 값으로 알려져 있다. */
const GOLDEN_RATIO_CONJUGATE = 0.618033988749895;
/** 시작 시점을 흩는 데 쓰는 무리수. 주기와 다른 값이어야 둘이 함께 움직이지 않는다. */
const PLASTIC_NUMBER_CONJUGATE = 0.754877666246693;

/** crewId 는 1, 2, 3… 으로 이어지므로 옆 번호끼리 값이 붙지 않게 무리수 곱의 소수부로 흩는다. */
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
