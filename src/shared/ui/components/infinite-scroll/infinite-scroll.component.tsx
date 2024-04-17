import { FC, ReactNode, useEffect } from 'react';
import { cn } from '@/shared/lib/cn';
import useIntersectionObserver from '@/shared/lib/use-intersection-observer.hook';
import Loading from '@/shared/ui/components/loading/loading.component';

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
        <div ref={setRef} className={cn('h-[300px] max-h-full flexRowCenter text-[20px]')}>
          {hasMore ? <Loading /> : endMessage}
        </div>
      )}
    </div>
  );
};

export default InfiniteScroll;
