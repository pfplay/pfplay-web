import { useState, useEffect } from 'react';

const useIntersectionObserver = <E extends HTMLElement = HTMLElement>(
  options?: IntersectionObserverInit
) => {
  const [ref, setRef] = useState<E | null>(null);
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIntersecting(entry.isIntersecting),
      options
    );

    if (ref) {
      observer.observe(ref);
    }

    return () => {
      if (ref) {
        observer.unobserve(ref);
      }
    };
  }, [ref, options]);

  return { setRef, isIntersecting };
};

export default useIntersectionObserver;
