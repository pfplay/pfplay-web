'use client';
import { useLayoutEffect, useState } from 'react';
import Loading, { type LoadingProps } from './loading.component';

/**
 * 높이는 부모 높이를 따라갑니다.
 * - 부모가 flex column일 경우 - flex-grow: 1
 * - 부모가 flex column이 아닐 경우 - height: 100%
 */
export default function LoadingPaenl({ size = 24, ...rest }: LoadingProps) {
  const setRef = useVerticalStretch<HTMLDivElement>();

  return (
    <div ref={setRef} className='flexColCenter w-full p-[20px]'>
      <Loading size={size} {...rest} />
    </div>
  );
}

function useVerticalStretch<EL extends HTMLElement>() {
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
