import { useEffect } from 'react';
import { useStores } from '@/shared/lib/store/stores.context';
import type { AlertMessage } from '../model/alert.model';

type Props = {
  /**
   * callback을 실행할 조건입니다.
   */
  predicate: (message: AlertMessage) => boolean;
  callback: (message: AlertMessage) => void;
};

/**
 * 불필요한 effect를 방지하려면 props 내 함수들의 레퍼런스 변경을 최소화 해주세요
 */
export default function useAlert({ predicate, callback }: Props) {
  const alert = useStores().useCurrentPartyroom((state) => state.alert);

  useEffect(() => {
    const _callback = (message: AlertMessage) => {
      if (predicate(message)) {
        callback(message);
      }
    };

    alert.subscribe(_callback);

    return () => {
      alert.unsubscribe(_callback);
    };
  }, [alert, callback, predicate]);
}
