/**
 * 버그 추적/관측용 콘솔 로그를 현재 런타임에서 emit 해도 되는지 판정한다.
 *
 * 정책(2026-05-25): 진단 로그는 비프로덕션 — 로컬 개발 + Vercel preview(스테이징/개발 배포) —
 * 에서만 기본 노출된다. 프로덕션(`NEXT_PUBLIC_VERCEL_ENV === 'production'`)에선 침묵하되,
 * 운영 중 긴급 디버깅을 위해 `window.debugLevel` 을 수동 상향하면 escape hatch 로 노출된다.
 *
 * `NEXT_PUBLIC_VERCEL_ENV` 는 Vercel 시스템 환경변수다 (production / preview / development).
 * 로컬·테스트에선 미설정이므로 비프로덕션으로 간주한다.
 * ⚠️ Vercel 프로젝트의 "Automatically expose System Environment Variables"(기본 ON)가
 * 켜져 있어야 클라이언트 번들에 주입된다. 꺼져 있으면 prod 에서도 비프로덕션으로 간주되어
 * 로그가 샌다 — 게이트가 무력화되면 이 변수의 주입 여부부터 확인할 것.
 */
export function isProdRuntime(): boolean {
  return process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';
}

/**
 * 진단 로그 emit 가부를 반환한다.
 *
 * - 비프로덕션: 항상 `true` (window 접근 없이 즉시 반환).
 * - 프로덕션: 기본 `false`, `window.debugLevel > debugLevel` 일 때만 `true`.
 *
 * @param debugLevel 이 값보다 `window.debugLevel` 이 클 때만 prod 에서 노출 (기본 0).
 *
 * 서버 컨텍스트(window 부재)에선 window 에 접근하지 않는다 — 비프로덕션은 첫 분기에서
 * 반환되고, 프로덕션은 `typeof window` 가드로 단락된다 (L1 #314/#303 ReferenceError 회귀 방지).
 */
export function shouldEmitDiagnosticLog(debugLevel = 0): boolean {
  if (!isProdRuntime()) return true;
  return typeof window !== 'undefined' && window.debugLevel > debugLevel;
}
