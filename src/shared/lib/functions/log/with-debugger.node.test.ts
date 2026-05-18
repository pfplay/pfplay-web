// @vitest-environment node
// L1 (#314/#303): 서버측(SSR/RSC, window 부재)에서 withDebugger 가 무가드
// `window.debugLevel` 접근으로 ReferenceError 즉사 → 공유 axios 전 요청이
// 서버측에서 죽는 근본. 서버 컨텍스트에선 throw 없이 fallback 이어야 한다.
import withDebugger from './with-debugger';

describe('withDebugger (server / no window)', () => {
  const prev = process.env.NODE_ENV;
  beforeAll(() => {
    process.env.NODE_ENV = 'production';
  });
  afterAll(() => {
    process.env.NODE_ENV = prev;
  });

  test('window 부재 + production 이면 throw 없이 fallback 반환, fn 미호출', () => {
    expect(typeof window).toBe('undefined');

    const fn = vi.fn();

    expect(() => withDebugger(0)(fn, 'fallback')('a')).not.toThrow();
    expect(withDebugger(0)(fn, 'fallback')('a')).toBe('fallback');
    expect(fn).not.toHaveBeenCalled();
  });

  test('window 부재 + development 이면 기존대로 fn 호출(거동 보존)', () => {
    process.env.NODE_ENV = 'development';
    const fn = vi.fn().mockReturnValue('r');

    expect(withDebugger(0)(fn)('a')).toBe('r');
    expect(fn).toHaveBeenCalledWith('a');

    process.env.NODE_ENV = 'production';
  });
});
