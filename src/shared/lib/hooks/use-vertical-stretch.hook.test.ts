import { renderHook, act } from '@testing-library/react';
import { useVerticalStretch } from './use-vertical-stretch.hook';

describe('useVerticalStretch', () => {
  test('부모가 flex column이면 flex: 1이 설정된다', () => {
    const parent = document.createElement('div');
    const child = document.createElement('div');
    parent.appendChild(child);
    document.body.appendChild(parent);

    // getComputedStyle을 직접 설정할 수 없으므로 style로 설정
    parent.style.display = 'flex';
    parent.style.flexDirection = 'column';

    const { result } = renderHook(() => useVerticalStretch<HTMLDivElement>());

    act(() => {
      result.current(child);
    });

    expect(child.style.flex).toBe('1');

    document.body.removeChild(parent);
  });

  test('부모가 flex column이 아니면 height: 100%가 설정된다', () => {
    const parent = document.createElement('div');
    const child = document.createElement('div');
    parent.appendChild(child);
    document.body.appendChild(parent);

    parent.style.display = 'block';

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
