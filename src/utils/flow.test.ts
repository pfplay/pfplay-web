import { flow } from '@/utils/flow';

describe('utils/flow', () => {
  const wait = <T>(v: T) => {
    return new Promise<T>((resolve) => {
      setTimeout(() => {
        resolve(v);
      }, 50);
    });
  };
  const waitError = async (e: number): Promise<never> => {
    await wait('');
    throw e + 1;
  };
  const addOne = (x: number) => x + 1;
  const addOneAsync = (x: number) => wait(x + 1);
  const multiplyByTwo = (x: number) => x * 2;
  const multiplyByTwoAsync = (x: number) => wait(x * 2);
  const throwOneAddedAsync = (err: number) => waitError(err);

  test('단일 함수를 올바르게 처리해야 한다.', async () => {
    const functions = [addOne];
    const result = await flow(functions)(1);

    expect(result).toBe(2);
  });

  test('여러 함수를 올바르게 처리해야 한다.', async () => {
    const functions = [addOne, addOne, multiplyByTwo, multiplyByTwo];
    const result = await flow(functions)(1);

    expect(result).toBe(12);
  });

  test('비동기 함수가 포함되어도 올바르게 처리해야 한다.', async () => {
    const functions = [addOne, addOneAsync, multiplyByTwo, multiplyByTwoAsync];
    const result = await flow(functions)(1);

    expect(result).toBe(12);
  });

  test('에러 핸들러 목록도 올바르게 처리해야 한다.', async () => {
    const handlers = [throwOneAddedAsync, throwOneAddedAsync, throwOneAddedAsync];
    try {
      await flow(handlers)(1);
    } catch (e) {
      expect(e).toBe(4);
    }
  });
});
