import { useLayoutEffect, useState } from 'react';

/**
 * 요소 높이가 부모 높이를 따라가도록 합니다.
 * - 부모가 flex column일 경우 - flex-grow: 1
 * - 부모가 flex column이 아닐 경우 - height: 100%
 */
export function useVerticalStretch<EL extends HTMLElement>() {
  const [ref, setRef] = useState<EL | null>(null);

  useLayoutEffect(() => {
    if (ref && ref.parentElement) {
      const parentStyle = window.getComputedStyle(ref.parentElement);
      if (parentStyle.display === 'flex' && parentStyle.flexDirection === 'column') {
        ref.style.flex = '1';
      } else {
        ref.style.height = '100%';
      }
    }
  }, [ref]);

  return setRef;
}
