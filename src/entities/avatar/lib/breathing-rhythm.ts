/**
 * 정지 아바타(MotionType.NONE)의 호흡 리듬을 아바타마다 다르게 만든다.
 *
 * 전원이 같은 박자로 부풀었다 줄어들면 군집이 한 몸처럼 호흡하는 인상이라 보기 불편하다(#463).
 * 그래서 사람마다 주기와 시작 위상을 따로 준다.
 *
 * crewId 로 값을 정하므로 리렌더·입퇴장에도 같은 사람은 같은 리듬을 유지한다.
 * 난수나 배열 index 를 쓰면 누가 들어오고 나갈 때마다 리듬이 통째로 재배치된다.
 */

/**
 * 호흡 주기 범위 (초).
 *
 * 실제 사람 호흡(3~4초)에 맞춰봤더니 아바타가 늘어져 보였다. 화면 안에서는 사실성보다
 * 살아있는 느낌이 먼저라, 기존 1초 고정과 비슷한 템포를 유지하되 사람마다 폭을 준다.
 * 눈으로 보고 맞춘 값이라 조정해도 되는 숫자다 — 범위만 유지하면 분산은 알아서 따라온다.
 */
export const BREATH_PERIOD_MIN = 1.05;
export const BREATH_PERIOD_MAX = 1.75;

/**
 * 무리수를 곱한 소수부.
 *
 * crewId 는 1, 2, 3… 처럼 연속된 정수다. 무리수 곱의 소수부는 이런 연속값을 고르게 흩는
 * 성질이 있어서(저분산 수열), 해시 없이도 옆 번호끼리 멀리 떨어진다.
 */
const frac = (n: number, irrational: number): number => {
  const x = n * irrational;
  return x - Math.floor(x);
};

/** 황금비 켤레. 연속 정수를 가장 고르게 흩는 값으로 알려져 있다. */
const GOLDEN = 0.618033988749895;
/** 주기와 겹치지 않는 별개의 수열을 얻기 위한 두 번째 무리수. */
const PLASTIC = 0.754877666246693;

export type BreathingRhythm = {
  /** 한 번 들이쉬고 내쉬는 데 걸리는 시간 (초) */
  period: number;
  /** 시작 시점 어긋내기 (초, 0 이상 period 미만) */
  phase: number;
};

/** crewId → 그 아바타의 호흡 리듬. 같은 id 는 항상 같은 결과. */
const breathingRhythm = (crewId: number): BreathingRhythm => {
  const period = BREATH_PERIOD_MIN + frac(crewId, GOLDEN) * (BREATH_PERIOD_MAX - BREATH_PERIOD_MIN);

  return { period, phase: frac(crewId, PLASTIC) * period };
};

export default breathingRhythm;
