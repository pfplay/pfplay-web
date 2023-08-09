export function flow<T>(functions: ((...args: T[]) => T | Promise<T>)[]) {
  const length = functions.length;

  return async (...args: T[]) => {
    let index = 0;
    let result: T = length ? await functions[index](...args) : args[0];
    while (++index < length) {
      result = await functions[index](result);
    }
    return result;
  };
}
