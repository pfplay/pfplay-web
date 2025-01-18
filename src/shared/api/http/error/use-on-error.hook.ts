import { useEffect } from 'react';
import { ErrorCode } from '@/shared/api/http/types/@shared';
import errorEmitter from './error-emitter';

export default function useOnError(errorCode: ErrorCode, callback: () => void) {
  useEffect(() => {
    const off = errorEmitter.on(errorCode, callback);

    return () => {
      off();
    };
  }, []);
}
