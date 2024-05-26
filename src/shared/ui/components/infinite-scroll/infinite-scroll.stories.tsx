// InfiniteScroll.stories.tsx
import { useState } from 'react';
import { Meta, StoryFn } from '@storybook/react';
import InfiniteScroll from './infinite-scroll.component';

const meta: Meta<typeof InfiniteScroll> = {
  title: 'base/InfiniteScroll',
  component: InfiniteScroll,
};

export default meta;

const mockData = new Array(50).fill(null).map((_, index) => `Item ${index + 1}`);
export const Preview: StoryFn<typeof meta> = () => {
  const [data, setData] = useState<string[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loadCount, setLoadCount] = useState(0);

  const loadMore = () => {
    if (loadCount >= 3) {
      setHasMore(false);
      return;
    }

    setTimeout(() => {
      setData((currentData) => [
        ...currentData,
        ...mockData.slice(loadCount * 10, (loadCount + 1) * 10),
      ]);
      setLoadCount(loadCount + 1);
    }, 1000); // Simulate network request delay
  };

  return (
    <InfiniteScroll loadMore={loadMore} hasMore={hasMore} className='h-[600px]'>
      {data.map((item) => (
        <div key={item} className='h-[100px]'>
          {item}
        </div>
      ))}
    </InfiniteScroll>
  );
};
