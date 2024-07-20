import { DependencyList, EffectCallback, useEffect, useRef } from 'react';

export default function useDidMountEffect(effect: EffectCallback, deps: DependencyList) {
  const didMount = useRef(false);

  useEffect(() => {
    if (didMount.current) {
      return effect();
    }
    didMount.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
