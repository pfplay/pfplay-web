import { EffectCallback, useEffect, useState } from 'react';

/**
 * react 18 버전 이후의 strict mode에서 발생하는 "DEV모드에서 useEffect가 2번 트리거되는, 의도된 동작"을 우회하기 위한 hook
 */
export default function useDidMountEffect(effect: EffectCallback) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    return effect();
  }, [mounted]);
}
