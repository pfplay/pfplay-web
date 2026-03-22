import { useEffect } from 'react';
import { useStores } from '@/shared/lib/store/stores.context';
import * as AlertMessage from '../../model/alert-message.model';

/**
 * 불필요한 effect를 방지하려면 인자로 오는 callback의 레퍼런스 변경을 최소화 해주세요
 */
export default function useAlert(callback: (message: AlertMessage.Model) => void) {
  const alert = useStores().useCurrentPartyroom((state) => state.alert);

  useEffect(() => {
    alert.subscribe(callback);

    return () => {
      alert.unsubscribe(callback);
    };
  }, [alert, callback]);
}
