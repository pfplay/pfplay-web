export function flow<T>(functions: ((...args: T[]) => T)[]) {
  const length = functions.length;

  return (...args: T[]) => {
    let index = 0;
    let result: T = length ? functions[index](...args) : args[0];
    while (++index < length) {
      result = functions[index](result);
    }
    return result;
  };
}
