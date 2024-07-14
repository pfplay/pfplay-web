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

export default function MockReturn<T>(params: Params<T>): any {
  return (_target: any, propertyKey: string, descriptor: PropertyDescriptor): void => {
    if (process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_USE_MOCK !== 'true') {
      return;
    }

    descriptor.value = () => {
      log(`[MockReturn] method: ${propertyKey}`);

      if ('error' in params) {
        throw params.error;
      }

      return params.data;
    };
  };
}
