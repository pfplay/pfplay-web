import { FC, ReactNode, useEffect } from 'react';
import Loading from '@/components/shared/atoms/Loading';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';
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
  const { setRef, isIntersecting } = useIntersectionObserver<HTMLDivElement>({
    root: null,
    rootMargin: '0px',
    threshold: 0.8,
  });

  useEffect(() => {
    if (isIntersecting && hasMore) {
      load();
    }
  }, [isIntersecting, hasMore]);

  return (
    <div className={className}>
      {children}
      {(hasMore || endMessage) && (
        <div ref={setRef} className={cn('h-[300px] flexRowCenter text-[20px]')}>
          {hasMore ? <Loading /> : endMessage}
        </div>
      )}
    </div>
  );
};

export default InfiniteScroll;
