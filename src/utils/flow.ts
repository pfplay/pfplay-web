type FunctionType<T> = (input: T) => T | Promise<T>;
type ErrorHandlerType<E = any> = (error: E) => Promise<never>;

export function flow<T, E = any>(functions: FunctionType<T>[] | ErrorHandlerType<E>[]) {
  return async (initialInput: T): Promise<T> => {
    let result: T | E = initialInput;

    for (const func of functions) {
      result = await processFunction(func, result);
    }

    if (result instanceof Error) {
      throw result;
    }

    return result as T;
  };
}

async function processFunction<T, E = any>(
  func: FunctionType<T> | ErrorHandlerType<E>,
  input: T | E
): Promise<T | E> {
  try {
    return await func(input as T & E);
  } catch (error) {
    return error as E;
  }
}
