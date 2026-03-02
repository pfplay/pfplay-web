import { PartialDeep } from 'type-fest';
import { update } from './update';

describe('update', () => {
  test('should return the next value when next is a value', () => {
    type Model = { a: number; b: number };
    const prev: Model = { a: 1, b: 2 };
    const next: Partial<Model> = { a: 3 };

    const result = update(prev, next);

    expect(result).toEqual({ a: 3, b: 2 });
  });

  test('should return the next value when next is a deep obj value', () => {
    type Model = { a: number; b: { c: number } };
    const prev: Model = { a: 1, b: { c: 2 } };
    const next: PartialDeep<Model> = { b: { c: 3 } };

    const result = update(prev, next);

    expect(result).toEqual({ a: 1, b: { c: 3 } });
  });

  test('should return the next value when next is a function', () => {
    type Model = { a: number; b: number };
    const prev: Model = { a: 1, b: 2 };
    const next = (prev: Model): Model => ({ ...prev, a: prev.a + 1 });

    const result = update(prev, next);

    expect(result).toEqual({ a: 2, b: 2 });
  });

  test('prev가 원시값이면 next로 대체', () => {
    const result = update(10, 20 as unknown as number);

    expect(result).toBe(20);
  });

  test('prev가 undefined + 함수 next → 함수 실행', () => {
    const next = (prev: undefined) => (prev === undefined ? 'created' : 'other');

    const result = update(undefined, next);

    expect(result).toBe('created');
  });
});
