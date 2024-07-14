import { warnLog } from '@/shared/lib/functions/log/logger';
import withDebugger from '@/shared/lib/functions/log/with-debugger';

const logger = withDebugger(0);
const log = logger(warnLog);

type Params<T> =
  | {
      data: T;
    }
  | {
      error: Error;
    };

type Options = {
  delay?: number;
};

export default function MockResolve<T>(params: Params<T>, options?: Options): any {
  return (_target: any, propertyKey: string, descriptor: PropertyDescriptor): void => {
    if (process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_USE_MOCK !== 'true') {
      return;
    }

    descriptor.value = () => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          log(`[MockResolve] method: ${propertyKey}`);

          if ('error' in params) {
            reject(params.error);
          } else {
            resolve(params.data);
          }
        }, options?.delay ?? 0);
      });
    };
  };
}
