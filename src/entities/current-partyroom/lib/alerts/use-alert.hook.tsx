import { useEffect } from 'react';
import { useStores } from '@/shared/lib/store/stores.context';
import type { AlertMessage } from '../../model/alert.model';

/**
 * 불필요한 effect를 방지하려면 인자로 오는 callback의 레퍼런스 변경을 최소화 해주세요
 */
export default function useAlert(callback: (message: AlertMessage) => void) {
  const alert = useStores().useCurrentPartyroom((state) => state.alert);

  useEffect(() => {
    alert.subscribe(callback);

    return () => {
      alert.unsubscribe(callback);
    };
  }, [alert, callback]);
}
