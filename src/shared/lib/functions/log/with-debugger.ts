/**
 * debug 조건일때만 실행되는 함수를 반환합니다.
 */
export default function withDebugger(debugLevel: number) {
  return <T, P = void>(fn: (...args: T[]) => P, fallback?: P) =>
    (...args: T[]) => {
      if (process.env.NODE_ENV === 'development' || window.debugLevel > debugLevel) {
        return fn(...args);
      }
      return fallback;
    };
}
