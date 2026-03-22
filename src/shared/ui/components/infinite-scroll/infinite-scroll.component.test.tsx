import { render, screen } from '@testing-library/react';
import InfiniteScroll from './infinite-scroll.component';

vi.mock('../loading', () => ({
  Loading: () => <span data-testid='loading' />,
}));

let mockIsIntersecting = false;
vi.mock('@/shared/lib/hooks/use-intersection-observer.hook', () => ({
  __esModule: true,
  default: () => ({
    setRef: vi.fn(),
    isIntersecting: mockIsIntersecting,
  }),
}));

describe('InfiniteScroll', () => {
  beforeEach(() => {
    mockIsIntersecting = false;
  });

  test('children이 렌더링된다', () => {
    render(
      <InfiniteScroll loadMore={vi.fn()} hasMore>
        <div>아이템 목록</div>
      </InfiniteScroll>
    );

    expect(screen.getByText('아이템 목록')).toBeTruthy();
  });

  test('hasMore=true일 때 Loading이 표시된다', () => {
    render(
      <InfiniteScroll loadMore={vi.fn()} hasMore>
        <div>목록</div>
      </InfiniteScroll>
    );

    expect(screen.getByTestId('loading')).toBeTruthy();
  });

  test('hasMore=false일 때 endMessage가 표시된다', () => {
    render(
      <InfiniteScroll loadMore={vi.fn()} hasMore={false} endMessage='더 이상 없습니다'>
        <div>목록</div>
      </InfiniteScroll>
    );

    expect(screen.getByText('더 이상 없습니다')).toBeTruthy();
  });

  test('hasMore=false + endMessage 미지정 시 기본 메시지가 표시된다', () => {
    render(
      <InfiniteScroll loadMore={vi.fn()} hasMore={false}>
        <div>목록</div>
      </InfiniteScroll>
    );

    expect(screen.getByText('No more data')).toBeTruthy();
  });

  test('isIntersecting + hasMore일 때 loadMore가 호출된다', () => {
    mockIsIntersecting = true;
    const loadMore = vi.fn();

    render(
      <InfiniteScroll loadMore={loadMore} hasMore>
        <div>목록</div>
      </InfiniteScroll>
    );

    expect(loadMore).toHaveBeenCalled();
  });

  test('isIntersecting + hasMore=false일 때 loadMore가 호출되지 않는다', () => {
    mockIsIntersecting = true;
    const loadMore = vi.fn();

    render(
      <InfiniteScroll loadMore={loadMore} hasMore={false}>
        <div>목록</div>
      </InfiniteScroll>
    );

    expect(loadMore).not.toHaveBeenCalled();
  });
});
