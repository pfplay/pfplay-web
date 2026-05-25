import { shouldEmitDiagnosticLog } from './log-environment';

/**
 * 진단/디버그 로그용 래퍼. 비프로덕션(로컬 + Vercel preview=스테이징)에선 항상 실행하고,
 * 프로덕션에선 침묵하되 `window.debugLevel` 수동 상향 시에만 실행한다.
 *
 * 환경 판정과 서버(window 부재) 안전성은 {@link shouldEmitDiagnosticLog} 에 위임한다.
 */
export default function withDebugger(debugLevel: number) {
  return <T, P = void>(fn: (...args: T[]) => P, fallback?: P) =>
    (...args: T[]) => {
      if (shouldEmitDiagnosticLog(debugLevel)) {
        return fn(...args);
      }
      return fallback;
    };
}
