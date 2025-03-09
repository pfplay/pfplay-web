export default function Singleton<T extends { new (...args: any[]): NonNullable<unknown> }>(
  target: T
): T {
  let instance: T;

  const newConstructor: any = function (...args: any[]) {
    if (instance) {
      return instance;
    }

    instance = new target(...args) as T;
    return instance;
  };

  newConstructor.prototype = target.prototype;

  return newConstructor;
}
