'use client';
import { useState } from 'react';
import { repeatAnimationFrame } from '@/shared/lib/functions/repeat-animation-frame';
import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect.hook';

const useIntersectionObserver = <E extends HTMLElement = HTMLElement>(
  options?: IntersectionObserverInit
) => {
  const [ref, setRef] = useState<E | null>(null);
  const [isIntersecting, setIntersecting] = useState(false);
  const [observed, setObserved] = useState(false);

  useIsomorphicLayoutEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIntersecting(entry.isIntersecting),
      options
    );

    if (ref) {
      observer.observe(ref);

      /**
       * 페이지 진입 즉시 intersecting이 true일 경우,
       * setObserved를 observe 직후 즉시 호출하면 IntersectionObserver 콜백 내 setIntersecting보다 먼저 호출되어
       * 일순간 상태 무결성이 깨질 수 있습니다.
       * 임의의 시간만큼 지연시킨 후 호출하여 이를 최대한 방지합니다.
       */
      repeatAnimationFrame(() => {
        setObserved(true);
      }, 30);
    }

    return () => {
      if (ref) {
        observer.unobserve(ref);
      }
    };
  }, [ref, options]);

  return { setRef, isIntersecting, observed };
};

export default useIntersectionObserver;
