import type { LegacyRef, MutableRefObject, RefCallback } from 'react';

/**
 * prop으로 전달받은 ref와 내부에서 사용하는 ref를 합쳐야할 때 사용할 수 있습니다.
 */
export function combineRef<T>(
  refs: Array<MutableRefObject<T> | LegacyRef<T> | undefined | null>
): RefCallback<T> {
  return (value) => {
    refs.forEach((ref) => {
      if (typeof ref === 'function') {
        ref(value);
      } else if (ref != null) {
        (ref as MutableRefObject<T | null>).current = value;
      }
    });
  };
}
