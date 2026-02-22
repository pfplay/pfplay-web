import { cn } from './cn';

describe('cn', () => {
  test('단일 클래스', () => {
    expect(cn('text-red-500')).toBe('text-red-500');
  });

  test('여러 클래스 병합', () => {
    expect(cn('px-2', 'py-1')).toBe('px-2 py-1');
  });

  test('조건부 클래스', () => {
    const isHidden = false;
    const isVisible = true;
    expect(cn('base', isHidden && 'hidden', isVisible && 'visible')).toBe('base visible');
  });

  test('tailwind 충돌 클래스 병합 (후자 우선)', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });

  test('빈 입력', () => {
    expect(cn()).toBe('');
  });

  test('undefined/null 무시', () => {
    expect(cn('base', undefined, null)).toBe('base');
  });
});
