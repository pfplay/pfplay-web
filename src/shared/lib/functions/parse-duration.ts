/** "[H:]M:SS" 표시 문자열 → 총 초. 토큰이 비숫자/빈값이거나 형식 불명이면 null(배지 미표시 fail-safe). */
export function parseDurationToSeconds(duration: string): number | null {
  if (typeof duration !== 'string') return null;
  const parts = duration.trim().split(':');
  if (parts.length < 2 || parts.length > 3) return null;
  const nums = parts.map((p) => (/^\d+$/.test(p.trim()) ? Number(p.trim()) : NaN));
  if (nums.some((n) => Number.isNaN(n))) return null;
  return nums.reduce((acc, n) => acc * 60 + n, 0);
}
