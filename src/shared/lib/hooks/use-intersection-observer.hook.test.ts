import { renderHook, act } from '@testing-library/react';
import useIntersectionObserver from './use-intersection-observer.hook';

vi.mock('@/shared/lib/functions/repeat-animation-frame', () => ({
  repeatAnimationFrame: (fn: () => void) => {
    fn();
    return () => {};
  },
}));

let observerCallback: IntersectionObserverCallback;
const mockObserve = vi.fn();
const mockUnobserve = vi.fn();
const mockDisconnect = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();

  vi.stubGlobal(
    'IntersectionObserver',
    vi.fn(function (this: any, cb: IntersectionObserverCallback) {
      observerCallback = cb;
      this.observe = mockObserve;
      this.unobserve = mockUnobserve;
      this.disconnect = mockDisconnect;
      this.takeRecords = vi.fn();
      this.root = null;
      this.rootMargin = '';
      this.thresholds = [];
    })
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useIntersectionObserver', () => {
  test('초기 상태에서 isIntersecting은 false이다', () => {
    const { result } = renderHook(() => useIntersectionObserver());
    expect(result.current.isIntersecting).toBe(false);
  });

  test('ref가 설정되면 observe가 호출된다', () => {
    const { result } = renderHook(() => useIntersectionObserver());
    const el = document.createElement('div');

    act(() => {
      result.current.setRef(el);
    });

    expect(mockObserve).toHaveBeenCalledWith(el);
  });

  test('IntersectionObserver 콜백으로 isIntersecting이 업데이트된다', () => {
    const { result } = renderHook(() => useIntersectionObserver());
    const el = document.createElement('div');

    act(() => {
      result.current.setRef(el);
    });

    act(() => {
      observerCallback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver
      );
    });

    expect(result.current.isIntersecting).toBe(true);
  });

  test('options이 IntersectionObserver에 전달된다', () => {
    const options = { threshold: 0.5, rootMargin: '10px' };
    renderHook(() => useIntersectionObserver(options));

    expect(global.IntersectionObserver).toHaveBeenCalledWith(expect.any(Function), options);
  });
});
