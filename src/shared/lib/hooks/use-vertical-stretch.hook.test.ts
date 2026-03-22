import { renderHook, act } from '@testing-library/react';
import { useVerticalStretch } from './use-vertical-stretch.hook';

describe('useVerticalStretch', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('부모가 flex column이면 flex: 1이 설정된다', () => {
    const parent = document.createElement('div');
    const child = document.createElement('div');
    parent.appendChild(child);
    document.body.appendChild(parent);

    // jsdom의 getComputedStyle은 인라인 스타일을 정확히 반영하지 않으므로 직접 mock
    vi.stubGlobal(
      'getComputedStyle',
      vi.fn().mockReturnValue({
        display: 'flex',
        flexDirection: 'column',
      })
    );

    const { result } = renderHook(() => useVerticalStretch<HTMLDivElement>());

    act(() => {
      result.current(child);
    });

    expect(child.style.flexGrow).toBe('1');

    document.body.removeChild(parent);
  });

  test('부모가 flex column이 아니면 height: 100%가 설정된다', () => {
    const parent = document.createElement('div');
    const child = document.createElement('div');
    parent.appendChild(child);
    document.body.appendChild(parent);

    vi.stubGlobal(
      'getComputedStyle',
      vi.fn().mockReturnValue({
        display: 'block',
        flexDirection: '',
      })
    );

    const { result } = renderHook(() => useVerticalStretch<HTMLDivElement>());

    act(() => {
      result.current(child);
    });

    expect(child.style.height).toBe('100%');

    document.body.removeChild(parent);
  });

  test('ref가 null이면 아무 동작도 하지 않는다', () => {
    const { result } = renderHook(() => useVerticalStretch<HTMLDivElement>());

    act(() => {
      result.current(null);
    });

    // No error thrown
  });
});
