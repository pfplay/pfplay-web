import { isPureObject } from '@/shared/lib/functions/is-pure-object';

const KEY = 'skipGlobalErrorHandling' as const;

type Options<E> = {
  /**
   * @default true
   */
  when?: boolean | ((err: E) => boolean);
};

export default function SkipGlobalErrorHandling<E = unknown>({
  when = true,
}: Options<E> = {}): MethodDecorator {
  return function (_target, _propertyKey, descriptor) {
    const originalMethod = descriptor.value;

    if (typeof originalMethod !== 'function') {
      throw new Error('SkipGlobalErrorHandling can only be applied to methods.');
    }

    // @ts-expect-error - function is T
    descriptor.value = async function (...args: unknown[]) {
      try {
        return await originalMethod.apply(this, args);
      } catch (error) {
        const shouldSkipGlobalErrorHandling = typeof when === 'function' ? when(error as E) : when;

        if (shouldSkipGlobalErrorHandling) {
          Object.defineProperty(error, KEY, {
            value: true,
            enumerable: false,
            writable: false,
            configurable: false,
          });
        }

        throw error;
      }
    };

    return descriptor;
  };
}

export function shouldSkipGlobalErrorHandling(err: unknown): boolean {
  return isPureObject(err) && KEY in err && err[KEY] === true;
}
