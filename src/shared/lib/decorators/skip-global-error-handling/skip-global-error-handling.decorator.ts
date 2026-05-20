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
        // predicate 평가는 fail-safe — predicate 가 throw 하면(SSR-unsafe 글로벌 참조,
        // 사용자 predicate 버그 등) 원본 에러가 predicate 의 throw 로 가려지지 않도록
        // catch 하고 skip 플래그 미부착(전역 에러 핸들러 정상 도달). (web#314 L3)
        let shouldSkipGlobalErrorHandling: boolean;
        if (typeof when === 'function') {
          try {
            shouldSkipGlobalErrorHandling = when(error as E);
          } catch {
            shouldSkipGlobalErrorHandling = false;
          }
        } else {
          shouldSkipGlobalErrorHandling = when;
        }

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
