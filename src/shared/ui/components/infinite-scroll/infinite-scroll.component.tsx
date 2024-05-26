import { FC, ReactNode, useEffect } from 'react';
import { cn } from '@/shared/lib/functions/cn';
import useIntersectionObserver from '@/shared/lib/hooks/use-intersection-observer.hook';
import { Loading } from '../loading';

interface Props {
  loadMore: () => void;
  hasMore: boolean;
  endMessage?: ReactNode;
  children?: ReactNode;
  /**
   * 로딩, end message를 감싸는 컨테이너의 높이입니다.
   */
  observedHeight?: number;
}

const InfiniteScroll: FC<Props> = ({
  children,
  loadMore,
  hasMore,
  endMessage = 'No more data',
  observedHeight = 300,
}) => {
  const { setRef, isIntersecting } = useIntersectionObserver<HTMLDivElement>({
    root: null,
    rootMargin: '0px',
    threshold: 0.8,
  });

  useEffect(() => {
    if (isIntersecting && hasMore) {
      loadMore();
    }
  }, [isIntersecting, hasMore]);

  return (
    <div>
      {children}
      <div
        ref={setRef}
        className={cn('max-h-full flexRowCenter text-[20px]')}
        style={{ height: observedHeight }}
      >
        {hasMore ? <Loading /> : endMessage}
      </div>
    </div>
  );
};

export default InfiniteScroll;
