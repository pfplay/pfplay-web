import { CSSProperties, FC, ReactNode, useEffect } from 'react';
import { cn } from '@/shared/lib/functions/cn';
import useIntersectionObserver from '@/shared/lib/hooks/use-intersection-observer.hook';
import { Loading } from '../loading';

interface Props {
  loadMore: () => void;
  hasMore: boolean;
  endMessage?: ReactNode;
  children?: ReactNode;
  /**
   * 컨테이너의 높이입니다.
   */
  height?: CSSProperties['height'];
  /**
   * 로딩, end message를 감싸는 wrapper의 높이입니다.
   */
  observedHeight?: CSSProperties['height'];
}

const InfiniteScroll: FC<Props> = ({
  children,
  loadMore,
  hasMore,
  endMessage = 'No more data',
  height,
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
    <div style={{ height }}>
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
