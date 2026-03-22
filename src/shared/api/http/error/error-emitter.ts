import { EventEmitter } from '@/shared/lib/functions/event-emitter';
import type { ErrorCode } from '../types/@shared';

/**
 * ErrorCode를 emit하도록 하는 emitter입니다.
 * 아래와 같이 사용할 수 있습니다.
 *
 * 1. 이 emitter를 백엔드 api 호출 시 에러 처리 인터셉터에 적용하여, 모든 에러의 errorCode를 emit하도록 합니다.
 * 2. 전역 에러 핸들러에서 "특정 에러"를 예외 처리합니다.
 * 3. 그리고 이 emitter로 구독하여 2번에서 예외 처리한 "특정 에러" 발생을 구독하여, 전역 에러 핸들러 동작과는 다른 특정 동작을 수행합니다.
 */
class ErrorEmitter extends EventEmitter<ErrorCode> {
  private static instance: ErrorEmitter;

  public static getInstance(): ErrorEmitter {
    if (!this.instance) {
      this.instance = new ErrorEmitter();
    }
    return this.instance;
  }
}

const errorEmitter = ErrorEmitter.getInstance();

export default errorEmitter;
