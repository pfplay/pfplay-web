import { FC, ReactNode, useCallback, useEffect, useRef } from 'react';
import Loading from '@/components/shared/atoms/Loading';
import { cn } from '@/utils/cn';

interface Props {
  load: () => void;
  hasMore: boolean;
  endMessage?: ReactNode;
  children?: ReactNode;
  className?: string;
}

const InfiniteScroll: FC<Props> = ({
  children,
  load,
  hasMore,
  endMessage = 'No more data',
  className,
}) => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const observedRef = useRef<HTMLDivElement | null>(null);

  const handleIntersect: IntersectionObserverCallback = useCallback(
    (entries) => {
      if (entries[0].isIntersecting && hasMore) {
        load();
      }
    },
    [load, hasMore]
  );

  useEffect(() => {
    observerRef.current = new IntersectionObserver(handleIntersect, {
      root: null,
      rootMargin: '0px',
      threshold: 0.8,
    });

    if (observedRef.current) {
      observerRef.current.observe(observedRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleIntersect]);

  useEffect(() => {
    if (observerRef.current && observedRef.current) {
      observerRef.current.disconnect();
      observerRef.current.observe(observedRef.current);
    }
  }, [hasMore]);

  return (
    <div className={className}>
      {children}
      {(hasMore || endMessage) && (
        <div ref={observedRef} className={cn('h-[300px] flexRowCenter text-[20px]')}>
          {hasMore ? <Loading /> : endMessage}
        </div>
      )}
    </div>
  );
};

export default InfiniteScroll;
