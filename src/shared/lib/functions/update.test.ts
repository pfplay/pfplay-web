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
});
