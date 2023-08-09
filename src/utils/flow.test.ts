import { flow } from '@/utils/flow';

type AnyFunction = (...args: unknown[]) => void;

describe('utils/flow', () => {
  const addOne = (x: number) => x + 1;
  const multiplyByTwo = (x: number) => x * 2;

  it('빈 입력을 올바르게 처리해야 한다.', () => {
    const functions: AnyFunction[] = [];
    const result = flow(functions)();
    expect(result).toBeUndefined();
  });

  it('단일 함수를 올바르게 처리해야 한다.', () => {
    const functions = [addOne];
    const result = flow(functions)(5);

    expect(result).toBe(6);
  });

  it('여러 함수를 올바르게 처리해야 한다.', () => {
    const functions = [addOne, multiplyByTwo, addOne, multiplyByTwo, addOne];
    const result = flow(functions)(5);

    expect(result).toBe(27); // ((((5 + 1) * 2) + 1) * 2) + 1 = 27
  });
});
